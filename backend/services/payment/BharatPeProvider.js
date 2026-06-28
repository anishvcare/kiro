/**
 * BharatPe Payment Provider
 * Handles payment processing through BharatPe gateway
 */
class BharatPeProvider {
  constructor(config = {}) {
    this.merchantId = config.merchant_id || process.env.BHARATPE_MERCHANT_ID;
    this.apiKey = config.api_key || process.env.BHARATPE_API_KEY;
    this.apiSecret = config.api_secret || process.env.BHARATPE_API_SECRET;
    this.baseUrl = config.base_url || process.env.BHARATPE_BASE_URL || 'https://api.bharatpe.com';
    this.webhookSecret = config.webhook_secret || process.env.BHARATPE_WEBHOOK_SECRET;
    this.name = 'bharatpe';
  }

  /**
   * Check if the provider is properly configured
   * @returns {boolean}
   */
  isAvailable() {
    return !!(this.merchantId && this.apiKey && this.apiSecret);
  }

  /**
   * Authenticate with BharatPe merchant API
   * @returns {object} Auth token
   */
  async authenticate() {
    if (!this.isAvailable()) {
      throw new Error('BharatPe provider is not configured. Missing credentials.');
    }

    // In production, this would call BharatPe's auth endpoint
    return {
      token: `bharatpe_auth_${Date.now()}`,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  /**
   * Create a payment link for the customer
   * @param {object} params - Payment parameters
   * @returns {object} Payment link details
   */
  async createPaymentLink(params) {
    const { amount, orderId, customerName, customerPhone, description } = params;

    if (!amount || !orderId) {
      throw new Error('Amount and orderId are required');
    }

    // In production, this would call BharatPe's payment link API
    const paymentLink = {
      id: `bpe_link_${Date.now()}`,
      url: `${this.baseUrl}/pay/${this.merchantId}/${orderId}`,
      amount: parseFloat(amount),
      order_id: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      description: description || `Payment for order ${orderId}`,
      status: 'created',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours
    };

    return paymentLink;
  }

  /**
   * Generate a dynamic QR code for payment
   * @param {object} params - QR code parameters
   * @returns {object} QR code data
   */
  async generateDynamicQR(params) {
    const { amount, orderId, description } = params;

    if (!amount || !orderId) {
      throw new Error('Amount and orderId are required');
    }

    // In production, this would call BharatPe's dynamic QR API
    const qrData = {
      id: `bpe_qr_${Date.now()}`,
      qr_string: `bharatpe://pay?mid=${this.merchantId}&amt=${amount}&oid=${orderId}`,
      amount: parseFloat(amount),
      order_id: orderId,
      description: description || `Payment for order ${orderId}`,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
    };

    return qrData;
  }

  /**
   * Create a UPI payment request
   * @param {object} params - UPI payment parameters
   * @returns {object} UPI payment details
   */
  async createUPIRequest(params) {
    const { amount, orderId, payerVPA, description } = params;

    if (!amount || !orderId) {
      throw new Error('Amount and orderId are required');
    }

    // In production, this would call BharatPe's UPI collect API
    const upiRequest = {
      id: `bpe_upi_${Date.now()}`,
      transaction_ref: `BPE${Date.now()}`,
      amount: parseFloat(amount),
      order_id: orderId,
      payer_vpa: payerVPA,
      description: description || `Payment for order ${orderId}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    return upiRequest;
  }

  /**
   * Process incoming webhook from BharatPe
   * @param {object} payload - Webhook payload
   * @param {string} signature - Webhook signature for verification
   * @returns {object} Processed webhook result
   */
  async processWebhook(payload, signature) {
    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const { event, data } = payload;

    const result = {
      event_type: event,
      transaction_id: data.transaction_id || data.id,
      order_id: data.order_id,
      amount: data.amount,
      status: this.mapWebhookStatus(event),
      raw_data: payload,
      processed_at: new Date().toISOString(),
    };

    return result;
  }

  /**
   * Verify payment status with BharatPe
   * @param {string} transactionId - Transaction ID to verify
   * @returns {object} Payment status
   */
  async verifyPaymentStatus(transactionId) {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    // In production, this would call BharatPe's status API
    return {
      transaction_id: transactionId,
      status: 'pending',
      verified_at: new Date().toISOString(),
    };
  }

  /**
   * Create a settlement record
   * @param {object} params - Settlement parameters
   * @returns {object} Settlement details
   */
  async createSettlementRecord(params) {
    const { transactionId, amount, shopId } = params;

    return {
      id: `bpe_settle_${Date.now()}`,
      transaction_id: transactionId,
      amount: parseFloat(amount),
      shop_id: shopId,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Verify webhook signature
   * @private
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('BharatPe webhook secret not configured, skipping verification');
      return true;
    }
    // In production, use crypto.createHmac to verify
    return !!signature;
  }

  /**
   * Map webhook event to payment status
   * @private
   */
  mapWebhookStatus(event) {
    const statusMap = {
      'payment.success': 'success',
      'payment.failed': 'failed',
      'payment.pending': 'pending',
      'refund.success': 'refunded',
      'refund.failed': 'refund_failed',
    };
    return statusMap[event] || 'unknown';
  }
}

module.exports = BharatPeProvider;
