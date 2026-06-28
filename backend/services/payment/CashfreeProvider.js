/**
 * Cashfree Payment Provider - Placeholder
 * To be implemented when Cashfree integration is needed
 */
class CashfreeProvider {
  constructor(config = {}) {
    this.name = 'cashfree';
    this.appId = config.app_id || process.env.CASHFREE_APP_ID;
    this.secretKey = config.secret_key || process.env.CASHFREE_SECRET_KEY;
  }

  isAvailable() {
    return !!(this.appId && this.secretKey);
  }

  async createPayment(params) {
    throw new Error('Cashfree provider is not yet implemented');
  }

  async verifyPayment(params) {
    throw new Error('Cashfree provider is not yet implemented');
  }

  async processWebhook(payload, signature) {
    throw new Error('Cashfree provider is not yet implemented');
  }

  async getPaymentStatus(transactionId) {
    throw new Error('Cashfree provider is not yet implemented');
  }

  async createRefund(params) {
    throw new Error('Cashfree provider is not yet implemented');
  }
}

module.exports = CashfreeProvider;
