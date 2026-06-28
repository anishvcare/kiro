/**
 * Manual UPI Payment Provider
 * Generates UPI deep links and QR codes for manual payment verification
 * Fallback provider when BharatPe or other gateways are unavailable
 */
class ManualUPIProvider {
  constructor(config = {}) {
    this.name = 'manual_upi';
    this.defaultCurrency = config.currency || 'INR';
  }

  /**
   * This provider is always available as a fallback
   * @returns {boolean}
   */
  isAvailable() {
    return true;
  }

  /**
   * Generate a UPI deep link for payment
   * Format: upi://pay?pa=SHOP_UPI_ID&pn=SHOP_NAME&am=AMOUNT&cu=INR&tn=REQUEST_ID
   * @param {object} params - Payment parameters
   * @returns {object} UPI deep link details
   */
  generateDeepLink(params) {
    const { upiId, shopName, amount, requestId, currency } = params;

    if (!upiId || !amount) {
      throw new Error('UPI ID and amount are required');
    }

    const encodedShopName = encodeURIComponent(shopName || 'Shop');
    const encodedTxnNote = encodeURIComponent(requestId || `TXN${Date.now()}`);
    const cur = currency || this.defaultCurrency;

    const deepLink = `upi://pay?pa=${upiId}&pn=${encodedShopName}&am=${amount}&cu=${cur}&tn=${encodedTxnNote}`;

    return {
      deep_link: deepLink,
      upi_id: upiId,
      shop_name: shopName,
      amount: parseFloat(amount),
      currency: cur,
      request_id: requestId,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Generate payment data including deep link for QR code generation
   * @param {object} params - Payment parameters
   * @returns {object} Payment data with deep link for QR
   */
  async createPayment(params) {
    const { upiId, shopName, amount, requestId, shopPhone } = params;

    const linkData = this.generateDeepLink({
      upiId,
      shopName,
      amount,
      requestId,
    });

    return {
      id: `manual_upi_${Date.now()}`,
      provider: this.name,
      ...linkData,
      shop_phone: shopPhone || null,
      status: 'pending',
      requires_manual_verification: true,
    };
  }

  /**
   * Handle payment screenshot upload
   * @param {object} params - Screenshot details
   * @returns {object} Upload result
   */
  async handleScreenshotUpload(params) {
    const { transactionId, imageUrl, uploadedBy } = params;

    if (!transactionId || !imageUrl) {
      throw new Error('Transaction ID and image URL are required');
    }

    return {
      transaction_id: transactionId,
      image_url: imageUrl,
      uploaded_by: uploadedBy,
      status: 'pending_verification',
      uploaded_at: new Date().toISOString(),
    };
  }

  /**
   * Manually verify a payment (by shop owner or admin)
   * @param {object} params - Verification parameters
   * @returns {object} Verification result
   */
  async verifyPayment(params) {
    const { transactionId, verifiedBy, upiRefNumber, approved } = params;

    if (!transactionId || !verifiedBy) {
      throw new Error('Transaction ID and verifier ID are required');
    }

    return {
      transaction_id: transactionId,
      verified_by: verifiedBy,
      upi_ref_number: upiRefNumber || null,
      status: approved ? 'verified' : 'rejected',
      verified_at: new Date().toISOString(),
    };
  }

  /**
   * Get payment status - always requires manual check
   * @param {string} transactionId
   * @returns {object} Status info
   */
  async getPaymentStatus(transactionId) {
    return {
      transaction_id: transactionId,
      provider: this.name,
      note: 'Manual UPI payments require manual verification by shop owner or admin',
    };
  }
}

module.exports = ManualUPIProvider;
