/**
 * Razorpay Payment Provider - Placeholder
 * To be implemented when Razorpay integration is needed
 */
class RazorpayProvider {
  constructor(config = {}) {
    this.name = 'razorpay';
    this.keyId = config.key_id || process.env.RAZORPAY_KEY_ID;
    this.keySecret = config.key_secret || process.env.RAZORPAY_KEY_SECRET;
  }

  isAvailable() {
    return !!(this.keyId && this.keySecret);
  }

  async createPayment(params) {
    throw new Error('Razorpay provider is not yet implemented');
  }

  async verifyPayment(params) {
    throw new Error('Razorpay provider is not yet implemented');
  }

  async processWebhook(payload, signature) {
    throw new Error('Razorpay provider is not yet implemented');
  }

  async getPaymentStatus(transactionId) {
    throw new Error('Razorpay provider is not yet implemented');
  }

  async createRefund(params) {
    throw new Error('Razorpay provider is not yet implemented');
  }
}

module.exports = RazorpayProvider;
