import EmailLogModel from "../models/emailLog.model.js";

const EMAIL_TEMPLATES = {
  app_installed: {
    type: "welcome",
    title: "Welcome to BusyBuddy! 🎉",
    templateId: "welcome_template",
  },
  app_uninstalled: {
    type: "goodbye",
    title: "We're sorry to see you go",
    templateId: "uninstall_survey_template",
  },
  subscription_upgraded: {
    type: "upgrade_confirmation",
    title: "Your plan has been upgraded!",
    templateId: "upgrade_confirmation_template",
  },
  subscription_downgraded: {
    type: "downgrade_confirmation",
    title: "Your plan has been changed",
    templateId: "downgrade_confirmation_template",
  },
  review_submitted: {
    type: "review_thank_you",
    title: "Thank you for your review!",
    templateId: "review_thank_you_template",
  },
};

const MAILCHIMP_SEGMENTS = {
  all_merchants: "all_merchants",
  active_merchants: "active_merchants",
  churned_merchants: "churned_merchants",
  free_plan: "free_plan_users",
  paid_plan: "paid_plan_users",
  reviewers: "merchants_who_reviewed",
};

class MailchimpAdapter {
  constructor() {
    this.apiKey = process.env.MAILCHIMP_API_KEY || "";
    this.serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || "us1";
    this.defaultListId = process.env.MAILCHIMP_DEFAULT_LIST_ID || "";
  }

  getBaseUrl() {
    return `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
  }

  getAuthHeader() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async addOrUpdateMember(listId, memberData) {
    const url = `${this.getBaseUrl()}/lists/${listId}/members`;
    const emailHash = this.hashEmail(memberData.email);

    try {
      const response = await fetch(`${url}/${emailHash}`, {
        method: "PUT",
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          email_address: memberData.email,
          status_if_new: "subscribed",
          merge_fields: {
            FNAME: memberData.firstName || "",
            LNAME: memberData.lastName || "",
            SHOP: memberData.shopDomain || "",
            PLAN: memberData.plan || "Free",
          },
          tags: memberData.tags || [],
        }),
      });

      const data = await response.json();
      return { success: response.ok, data, memberId: emailHash };
    } catch (error) {
      console.error("Mailchimp addOrUpdateMember error:", error);
      return { success: false, error: error.message };
    }
  }

  async addTagsToMember(listId, emailHash, tags) {
    const url = `${this.getBaseUrl()}/lists/${listId}/members/${emailHash}/tags`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          tags: tags.map((tag) => ({ name: tag, status: "active" })),
        }),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Mailchimp addTagsToMember error:", error);
      return { success: false, error: error.message };
    }
  }

  async removeTagsFromMember(listId, emailHash, tags) {
    const url = `${this.getBaseUrl()}/lists/${listId}/members/${emailHash}/tags`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          tags: tags.map((tag) => ({ name: tag, status: "inactive" })),
        }),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Mailchimp removeTagsFromMember error:", error);
      return { success: false, error: error.message };
    }
  }

  async sendTransactionalEmail(templateName, recipient, variables) {
    // Note: Mailchimp Transactional (Mandrill) API would be used here
    // For regular Mailchimp, we create an automation or use campaigns
    const mandrillKey = process.env.MANDRILL_API_KEY || this.apiKey;

    try {
      const response = await fetch("https://mandrillapp.com/api/1.0/messages/send-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: mandrillKey,
          template_name: templateName,
          template_content: [],
          message: {
            to: [{ email: recipient.email, name: recipient.name || "" }],
            merge_vars: [
              {
                rcpt: recipient.email,
                vars: Object.entries(variables).map(([name, content]) => ({
                  name: name.toUpperCase(),
                  content,
                })),
              },
            ],
            tags: [templateName],
          },
        }),
      });

      const data = await response.json();
      return {
        success: response.ok && data[0]?.status !== "rejected",
        data,
        messageId: data[0]?._id,
      };
    } catch (error) {
      console.error("Mandrill sendTransactionalEmail error:", error);
      return { success: false, error: error.message };
    }
  }

  hashEmail(email) {
    const crypto = require("crypto");
    return crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
  }
}

class EmailService {
  constructor() {
    this.mailchimp = new MailchimpAdapter();
  }

  async sendEventEmail(eventType, merchantData, eventData = {}) {
    const template = EMAIL_TEMPLATES[eventType];
    if (!template) {
      console.warn(`No email template configured for event: ${eventType}`);
      return { success: false, error: "No template configured" };
    }

    const emailLog = new EmailLogModel({
      shopId: merchantData.shopId,
      myshopify_domain: merchantData.myshopify_domain,
      merchantEmail: merchantData.email,
      merchantName: merchantData.name || merchantData.shopName || "",
      emailType: template.type,
      emailTitle: template.title,
      eventTrigger: eventType,
      eventId: eventData.eventId || null,
      status: "pending",
    });

    try {
      // Save initial log entry
      await emailLog.save();

      // Update/Add member to Mailchimp list
      const memberResult = await this.mailchimp.addOrUpdateMember(
        this.mailchimp.defaultListId,
        {
          email: merchantData.email,
          firstName: merchantData.name?.split(" ")[0] || "",
          lastName: merchantData.name?.split(" ").slice(1).join(" ") || "",
          shopDomain: merchantData.myshopify_domain,
          plan: merchantData.plan || "Free",
          tags: this.getTagsForEvent(eventType, merchantData),
        }
      );

      if (memberResult.success) {
        emailLog.mailchimpData.memberId = memberResult.memberId;
        emailLog.mailchimpData.listId = this.mailchimp.defaultListId;
      }

      // Send transactional email
      const emailResult = await this.mailchimp.sendTransactionalEmail(
        template.templateId,
        { email: merchantData.email, name: merchantData.name || "" },
        {
          shop_name: merchantData.shopName || merchantData.myshopify_domain,
          shop_domain: merchantData.myshopify_domain,
          plan_name: merchantData.plan || "Free",
          event_date: new Date().toLocaleDateString(),
          ...eventData.templateVars,
        }
      );

      if (emailResult.success) {
        emailLog.status = "sent";
        emailLog.sentAt = new Date();
        emailLog.mailchimpData.campaignId = emailResult.messageId;
      } else {
        emailLog.status = "failed";
        emailLog.errorMessage = emailResult.error || "Unknown error";
        emailLog.retryCount += 1;
      }

      await emailLog.save();

      return {
        success: emailResult.success,
        emailLogId: emailLog._id,
        mailchimpData: emailLog.mailchimpData,
      };
    } catch (error) {
      console.error("EmailService.sendEventEmail error:", error);

      emailLog.status = "failed";
      emailLog.errorMessage = error.message;
      await emailLog.save();

      return {
        success: false,
        error: error.message,
        emailLogId: emailLog._id,
      };
    }
  }

  getTagsForEvent(eventType, merchantData) {
    const baseTags = ["busybuddy_merchant"];

    switch (eventType) {
      case "app_installed":
        return [...baseTags, "active_install", `plan_${merchantData.plan || "free"}`];
      case "app_uninstalled":
        return [...baseTags, "churned", "uninstalled"];
      case "subscription_upgraded":
        return [...baseTags, "active_install", "upgraded", `plan_${merchantData.plan}`];
      case "subscription_downgraded":
        return [...baseTags, "active_install", "downgraded", `plan_${merchantData.plan}`];
      case "review_submitted":
        return [...baseTags, "reviewer", `rating_${merchantData.rating || 0}_stars`];
      default:
        return baseTags;
    }
  }

  async updateMemberSegment(email, oldSegments, newSegments) {
    const emailHash = this.mailchimp.hashEmail(email);
    const listId = this.mailchimp.defaultListId;

    if (oldSegments.length > 0) {
      await this.mailchimp.removeTagsFromMember(listId, emailHash, oldSegments);
    }

    if (newSegments.length > 0) {
      await this.mailchimp.addTagsToMember(listId, emailHash, newSegments);
    }
  }

  async retryFailedEmail(emailLogId) {
    const emailLog = await EmailLogModel.findById(emailLogId);
    if (!emailLog || emailLog.status !== "failed") {
      return { success: false, error: "Email not found or not in failed state" };
    }

    if (emailLog.retryCount >= emailLog.maxRetries) {
      return { success: false, error: "Max retries exceeded" };
    }

    return this.sendEventEmail(
      emailLog.eventTrigger,
      {
        shopId: emailLog.shopId,
        myshopify_domain: emailLog.myshopify_domain,
        email: emailLog.merchantEmail,
        name: emailLog.merchantName,
      },
      { eventId: emailLog.eventId }
    );
  }

  async getEmailHistory(shopDomain, options = {}) {
    const query = { myshopify_domain: shopDomain };

    if (options.status) {
      query.status = options.status;
    }

    if (options.eventTrigger) {
      query.eventTrigger = options.eventTrigger;
    }

    return EmailLogModel.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 50)
      .lean();
  }
}

export const emailService = new EmailService();
export { EMAIL_TEMPLATES, MAILCHIMP_SEGMENTS };
