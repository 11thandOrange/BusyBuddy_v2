import { google } from "googleapis";
import GoogleAnalytics from "../../models/googleAnalytics.model.js";

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://your-app.com/api/analytics/google/callback";

// Required scopes for Google Analytics
const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// Create OAuth2 client
function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * GET /api/analytics/google/status
 * Check if Google Analytics is connected for the current shop
 */
async function getGoogleStatus(req, res) {
  try {
    const session = res.locals.shopify.session;
    const shopDomain = session.shop;

    const connection = await GoogleAnalytics.findOne({ shopDomain });

    if (!connection) {
      return res.json({
        success: true,
        data: {
          connected: false,
        },
      });
    }

    // Check if token is expired
    const isExpired = new Date() >= new Date(connection.tokenExpiresAt);

    return res.json({
      success: true,
      data: {
        connected: true,
        email: connection.googleEmail,
        propertyId: connection.propertyId,
        propertyName: connection.propertyName || "All Properties",
        connectedAt: connection.connectedAt,
        tokenExpired: isExpired,
      },
    });
  } catch (error) {
    console.error("Error checking Google Analytics status:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/analytics/google/connect
 * Generate OAuth URL for Google Analytics connection
 */
async function initiateGoogleConnect(req, res) {
  try {
    const session = res.locals.shopify.session;
    const shopDomain = session.shop;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Google OAuth credentials not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.");
      return res.status(400).json({
        success: false,
        error: "Google Analytics integration is not configured. Please contact the app administrator to set up Google OAuth credentials.",
        details: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.",
      });
    }

    const oauth2Client = createOAuth2Client();

    // Generate the OAuth URL with state parameter containing shop domain
    const state = Buffer.from(JSON.stringify({ shopDomain })).toString("base64");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent select_account", // Force account selection and consent
      state: state,
    });

    return res.json({
      success: true,
      data: {
        authUrl,
      },
    });
  } catch (error) {
    console.error("Error initiating Google connection:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/analytics/google/callback
 * Handle OAuth callback from Google
 */
async function handleGoogleCallback(req, res) {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      console.error("OAuth error:", oauthError);
      return res.redirect("/?error=google_auth_failed&message=" + encodeURIComponent(oauthError));
    }

    if (!code || !state) {
      return res.redirect("/?error=google_auth_failed&message=Missing authorization code or state");
    }

    // Decode state to get shop domain
    let shopDomain;
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      shopDomain = stateData.shopDomain;
    } catch (e) {
      return res.redirect("/?error=google_auth_failed&message=Invalid state parameter");
    }

    const oauth2Client = createOAuth2Client();

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email;

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + (tokens.expiry_date ? tokens.expiry_date - Date.now() : 3600000));

    // Get GA4 properties (optional - get first available property)
    let propertyId = null;
    let propertyName = null;

    try {
      const analyticsAdmin = google.analyticsadmin({ version: "v1beta", auth: oauth2Client });
      const accountsResponse = await analyticsAdmin.accounts.list();
      
      if (accountsResponse.data.accounts && accountsResponse.data.accounts.length > 0) {
        const firstAccount = accountsResponse.data.accounts[0];
        const propertiesResponse = await analyticsAdmin.properties.list({
          filter: `parent:${firstAccount.name}`,
        });

        if (propertiesResponse.data.properties && propertiesResponse.data.properties.length > 0) {
          const firstProperty = propertiesResponse.data.properties[0];
          propertyId = firstProperty.name.replace("properties/", "");
          propertyName = firstProperty.displayName;
        }
      }
    } catch (gaError) {
      console.warn("Could not fetch GA4 properties:", gaError.message);
      // Continue without property - user might not have GA4 set up
    }

    // Save or update the connection in database
    await GoogleAnalytics.findOneAndUpdate(
      { shopDomain },
      {
        shopDomain,
        googleEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        tokenExpiresAt,
        propertyId,
        propertyName,
        connectedAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Redirect back to the app with success
    return res.redirect("/?google_connected=true");
  } catch (error) {
    console.error("Error handling Google callback:", error);
    return res.redirect("/?error=google_auth_failed&message=" + encodeURIComponent(error.message));
  }
}

/**
 * POST /api/analytics/google/disconnect
 * Disconnect Google Analytics account
 */
async function disconnectGoogle(req, res) {
  try {
    const session = res.locals.shopify.session;
    const shopDomain = session.shop;

    const connection = await GoogleAnalytics.findOne({ shopDomain });

    if (connection) {
      // Optionally revoke the token with Google
      try {
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({
          access_token: connection.accessToken,
          refresh_token: connection.refreshToken,
        });
        await oauth2Client.revokeCredentials();
      } catch (revokeError) {
        console.warn("Could not revoke Google token:", revokeError.message);
        // Continue anyway - we'll still remove from our database
      }

      // Remove from database
      await GoogleAnalytics.deleteOne({ shopDomain });
    }

    return res.json({
      success: true,
      message: "Google Analytics disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting Google Analytics:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Helper function to refresh access token if expired
 */
async function refreshTokenIfNeeded(connection) {
  const now = new Date();
  const expiresAt = new Date(connection.tokenExpiresAt);

  // Refresh if token expires in less than 5 minutes
  if (now >= new Date(expiresAt.getTime() - 5 * 60 * 1000)) {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: connection.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update the stored tokens
    connection.accessToken = credentials.access_token;
    connection.tokenExpiresAt = new Date(credentials.expiry_date);
    connection.updatedAt = new Date();
    await connection.save();

    return credentials.access_token;
  }

  return connection.accessToken;
}

/**
 * GET /api/analytics/google/data
 * Fetch Google Analytics data
 */
async function getGoogleAnalyticsData(req, res) {
  try {
    const session = res.locals.shopify.session;
    const shopDomain = session.shop;
    const { range = "30d" } = req.query;

    const connection = await GoogleAnalytics.findOne({ shopDomain });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Google Analytics not connected",
      });
    }

    if (!connection.propertyId) {
      return res.json({
        success: true,
        data: {
          message: "No Google Analytics property found. Please ensure you have a GA4 property set up.",
          totalSessions: 0,
          totalUsers: 0,
          totalPageviews: 0,
          avgSessionDuration: "0:00",
          trend: [],
          trafficSources: [],
          topPages: [],
        },
      });
    }

    // Refresh token if needed
    const accessToken = await refreshTokenIfNeeded(connection);

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: connection.refreshToken,
    });

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    let previousEndDate = new Date();

    if (range === "7d") {
      startDate.setDate(endDate.getDate() - 7);
      previousEndDate.setDate(startDate.getDate() - 1);
      previousStartDate.setDate(previousEndDate.getDate() - 7);
    } else if (range === "30d") {
      startDate.setDate(endDate.getDate() - 30);
      previousEndDate.setDate(startDate.getDate() - 1);
      previousStartDate.setDate(previousEndDate.getDate() - 30);
    } else if (range === "90d") {
      startDate.setDate(endDate.getDate() - 90);
      previousEndDate.setDate(startDate.getDate() - 1);
      previousStartDate.setDate(previousEndDate.getDate() - 90);
    }

    const formatDate = (date) => date.toISOString().split("T")[0];

    const analyticsData = google.analyticsdata({ version: "v1beta", auth: oauth2Client });
    const propertyId = `properties/${connection.propertyId}`;

    // Fetch main metrics
    const metricsResponse = await analyticsData.properties.runReport({
      property: propertyId,
      requestBody: {
        dateRanges: [
          { startDate: formatDate(startDate), endDate: formatDate(endDate) },
          { startDate: formatDate(previousStartDate), endDate: formatDate(previousEndDate) },
        ],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
        ],
      },
    });

    // Parse metrics
    const currentMetrics = metricsResponse.data.rows?.[0]?.metricValues || [];
    const previousMetrics = metricsResponse.data.rows?.[1]?.metricValues || [];

    const totalSessions = parseInt(currentMetrics[0]?.value || 0);
    const totalUsers = parseInt(currentMetrics[1]?.value || 0);
    const totalPageviews = parseInt(currentMetrics[2]?.value || 0);
    const avgDurationSeconds = parseFloat(currentMetrics[3]?.value || 0);

    const prevSessions = parseInt(previousMetrics[0]?.value || 1);
    const prevUsers = parseInt(previousMetrics[1]?.value || 1);
    const prevPageviews = parseInt(previousMetrics[2]?.value || 1);

    // Calculate percentage changes
    const sessionsChange = Math.round(((totalSessions - prevSessions) / prevSessions) * 100);
    const usersChange = Math.round(((totalUsers - prevUsers) / prevUsers) * 100);
    const pageviewsChange = Math.round(((totalPageviews - prevPageviews) / prevPageviews) * 100);

    // Format duration
    const minutes = Math.floor(avgDurationSeconds / 60);
    const seconds = Math.round(avgDurationSeconds % 60);
    const avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    // Fetch daily trend data
    const trendResponse = await analyticsData.properties.runReport({
      property: propertyId,
      requestBody: {
        dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "totalUsers" },
        ],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
    });

    const trend = (trendResponse.data.rows || []).map((row) => ({
      date: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value || 0),
      pageviews: parseInt(row.metricValues[1].value || 0),
      users: parseInt(row.metricValues[2].value || 0),
    }));

    // Fetch traffic sources
    const sourcesResponse = await analyticsData.properties.runReport({
      property: propertyId,
      requestBody: {
        dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 6,
      },
    });

    const trafficSources = (sourcesResponse.data.rows || []).map((row) => ({
      source: row.dimensionValues[0].value || "Direct",
      sessions: parseInt(row.metricValues[0].value || 0),
    }));

    // Fetch top pages
    const pagesResponse = await analyticsData.properties.runReport({
      property: propertyId,
      requestBody: {
        dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "totalUsers" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      },
    });

    const topPages = (pagesResponse.data.rows || []).map((row) => {
      const pageDuration = parseFloat(row.metricValues[2].value || 0);
      const pageMinutes = Math.floor(pageDuration / 60);
      const pageSeconds = Math.round(pageDuration % 60);

      return {
        path: row.dimensionValues[0].value,
        pageviews: parseInt(row.metricValues[0].value || 0),
        uniquePageviews: parseInt(row.metricValues[1].value || 0),
        avgTimeOnPage: `${pageMinutes}:${pageSeconds.toString().padStart(2, "0")}`,
        bounceRate: Math.round(parseFloat(row.metricValues[3].value || 0) * 100),
      };
    });

    return res.json({
      success: true,
      data: {
        totalSessions,
        totalUsers,
        totalPageviews,
        avgSessionDuration,
        sessionsChange,
        usersChange,
        pageviewsChange,
        trend,
        trafficSources,
        topPages,
      },
    });
  } catch (error) {
    console.error("Error fetching Google Analytics data:", error);

    // Handle specific Google API errors
    if (error.code === 403) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Please ensure Google Analytics API is enabled and you have proper permissions.",
      });
    }

    if (error.code === 401) {
      // Token might be invalid, remove the connection
      const session = res.locals.shopify.session;
      await GoogleAnalytics.deleteOne({ shopDomain: session.shop });

      return res.status(401).json({
        success: false,
        error: "Google Analytics authorization expired. Please reconnect your account.",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export {
  getGoogleStatus,
  initiateGoogleConnect,
  handleGoogleCallback,
  disconnectGoogle,
  getGoogleAnalyticsData,
};
