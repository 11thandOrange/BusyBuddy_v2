/**
 * Admin authentication middleware for referral management
 * Validates API key for admin-only operations
 */

export const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const adminApiKey = process.env.REFERRAL_ADMIN_API_KEY;

  // Check if admin API key is configured
  if (!adminApiKey) {
    console.error("REFERRAL_ADMIN_API_KEY is not configured in environment variables");
    return res.status(500).json({
      status: "ERROR",
      error: "Server configuration error",
    });
  }

  // Validate the API key
  if (!apiKey || apiKey !== adminApiKey) {
    return res.status(401).json({
      status: "ERROR",
      error: "Unauthorized - Invalid or missing API key",
    });
  }

  next();
};

export default { adminAuth };
