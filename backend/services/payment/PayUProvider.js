/**
 * PayU Payment Provider - Placeholder
 * To be implemented when PayU integration is needed
 */
class PayUProvider {
  constructor(config = {}) {
    this.name = 'payu';
    this.merchantKey = config.merchant_key || process.env.PAYU_MERCHANT_KEY;
    this.merchantSalt = config.merchant_salt || process.env.PAYU_MERCHANT_SALT;
  }

  isAvailable() {
    return !!(this.merchantKey && this.merchantSalt);
  }

  async createPayment(params) {
    throw new Error('PayU provider is not yet implemented');
  }

  async verifyPayment(params) {
    throw new Error('PayU provider is not yet implemented');
  }

  async processWebhook(payload, signature) {
    throw new Error('PayU provider is not yet implemented');
  }

  async getPaymentStatus(transactionId) {
    throw new Error('PayU provider is not yet implemented');
  }

  async createRefund(params) {
    throw new Error('PayU provider is not yet implemented');
  }
}

module.exports = PayUProvider;
