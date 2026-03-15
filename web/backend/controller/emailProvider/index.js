import EmailProvider from "../../models/emailProvider.model.js";
import Shop from "../../models/shop.model.js";
import EmailService, { EmailServiceError } from "../../services/emailService.js";

/**
 * Connect to an email provider
 */
async function connectEmailProvider(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { provider, apiKey, serverPrefix } = req.body;

    // Validate required fields
    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "Provider and API key are required",
      });
    }

    // Validate provider type
    const validProviders = ['mailchimp', 'klaviyo', 'sendgrid', 'mailerlite'];
    if (!validProviders.includes(provider.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid provider. Must be one of: ${validProviders.join(', ')}`,
      });
    }

    // Get shop data
    const shopData = await Shop.findOne({ shopDomain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Try to connect to the email provider
    const options = {};
    if (serverPrefix) {
      options.serverPrefix = serverPrefix;
    }

    const connectionResult = await EmailService.connect(provider, apiKey, options);

    // Save or update email provider settings
    const emailProviderData = {
      shopId: shopData._id,
      provider: provider.toLowerCase(),
      apiKey,
      serverPrefix: serverPrefix || "",
      isConnected: true,
      connectedAt: new Date(),
      lastSyncedAt: new Date(),
      lists: connectionResult.lists,
      templates: connectionResult.templates,
    };

    const emailProvider = await EmailProvider.findOneAndUpdate(
      { shopId: shopData._id },
      emailProviderData,
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully connected to ${provider}`,
      data: {
        provider: emailProvider.provider,
        isConnected: emailProvider.isConnected,
        connectedAt: emailProvider.connectedAt,
        lists: emailProvider.lists,
        templates: emailProvider.templates,
      },
    });
  } catch (error) {
    console.error("Error connecting email provider:", error);
    
    if (error instanceof EmailServiceError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
        provider: error.provider,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to connect email provider",
      error: error.message,
    });
  }
}

/**
 * Get current email provider settings
 */
async function getEmailProvider(req, res) {
  try {
    const { shop } = res.locals.shopify.session;

    const shopData = await Shop.findOne({ shopDomain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const emailProvider = await EmailProvider.findOne({ shopId: shopData._id });

    if (!emailProvider) {
      return res.status(200).json({
        success: true,
        data: {
          isConnected: false,
          provider: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        provider: emailProvider.provider,
        isConnected: emailProvider.isConnected,
        connectedAt: emailProvider.connectedAt,
        lastSyncedAt: emailProvider.lastSyncedAt,
        lists: emailProvider.lists,
        templates: emailProvider.templates,
        defaultListId: emailProvider.defaultListId,
        subscriptionCount: emailProvider.subscriptionCount,
      },
    });
  } catch (error) {
    console.error("Error fetching email provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email provider settings",
      error: error.message,
    });
  }
}

/**
 * Disconnect email provider
 */
async function disconnectEmailProvider(req, res) {
  try {
    const { shop } = res.locals.shopify.session;

    const shopData = await Shop.findOne({ shopDomain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const result = await EmailProvider.findOneAndDelete({ shopId: shopData._id });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No email provider connected",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email provider disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting email provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disconnect email provider",
      error: error.message,
    });
  }
}

/**
 * Refresh lists and templates from email provider
 */
async function syncEmailProvider(req, res) {
  try {
    const { shop } = res.locals.shopify.session;

    const shopData = await Shop.findOne({ shopDomain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const emailProvider = await EmailProvider.findOne({ shopId: shopData._id });

    if (!emailProvider || !emailProvider.isConnected) {
      return res.status(400).json({
        success: false,
        message: "No email provider connected",
      });
    }

    const options = {};
    if (emailProvider.serverPrefix) {
      options.serverPrefix = emailProvider.serverPrefix;
    }

    const refreshResult = await EmailService.refreshListsAndTemplates(
      emailProvider.provider,
      emailProvider.apiKey,
      options
    );

    // Update the stored lists and templates
    emailProvider.lists = refreshResult.lists;
    emailProvider.templates = refreshResult.templates;
    emailProvider.lastSyncedAt = new Date();
    await emailProvider.save();

    res.status(200).json({
      success: true,
      message: "Email provider synced successfully",
      data: {
        lists: emailProvider.lists,
        templates: emailProvider.templates,
        lastSyncedAt: emailProvider.lastSyncedAt,
      },
    });
  } catch (error) {
    console.error("Error syncing email provider:", error);
    
    if (error instanceof EmailServiceError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
        provider: error.provider,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to sync email provider",
      error: error.message,
    });
  }
}

/**
 * Get available lists
 */
async function getEmailLists(req, res) {
  try {
    const { shop } = res.locals.shopify.session;

    const shopData = await Shop.findOne({ shopDomain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const emailProvider = await EmailProvider.findOne({ shopId: shopData._id });

    if (!emailProvider || !emailProvider.isConnected) {
      return res.status(400).json({
        success: false,
        message: "No email provider connected",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        lists: emailProvider.lists,
      },
    });
  } catch (error) {
    console.error("Error fetching email lists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email lists",
      error: error.message,
    });
  }
}

/**
 * Get available templates
 */
async function getEmailTemplates(req, res) {
  try {
    const { shop } = res.locals.shopify.session;

    const shopData = await Shop.findOne({ shopDomain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const emailProvider = await EmailProvider.findOne({ shopId: shopData._id });

    if (!emailProvider || !emailProvider.isConnected) {
      return res.status(400).json({
        success: false,
        message: "No email provider connected",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        templates: emailProvider.templates,
      },
    });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email templates",
      error: error.message,
    });
  }
}

/**
 * Set default list
 */
async function setDefaultList(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { listId } = req.body;

    const shopData = await Shop.findOne({ shopDomain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const emailProvider = await EmailProvider.findOneAndUpdate(
      { shopId: shopData._id },
      { defaultListId: listId },
      { new: true }
    );

    if (!emailProvider) {
      return res.status(404).json({
        success: false,
        message: "No email provider connected",
      });
    }

    res.status(200).json({
      success: true,
      message: "Default list updated successfully",
      data: {
        defaultListId: emailProvider.defaultListId,
      },
    });
  } catch (error) {
    console.error("Error setting default list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set default list",
      error: error.message,
    });
  }
}

export {
  connectEmailProvider,
  getEmailProvider,
  disconnectEmailProvider,
  syncEmailProvider,
  getEmailLists,
  getEmailTemplates,
  setDefaultList,
};
