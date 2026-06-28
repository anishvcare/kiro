const BharatPeProvider = require('./BharatPeProvider');
const ManualUPIProvider = require('./ManualUPIProvider');
const RazorpayProvider = require('./RazorpayProvider');
const PayUProvider = require('./PayUProvider');
const CashfreeProvider = require('./CashfreeProvider');

/**
 * Payment Provider Factory
 * Returns the correct payment provider based on configuration
 */
class PaymentProviderFactory {
  constructor() {
    this.providers = {
      bharatpe: BharatPeProvider,
      manual_upi: ManualUPIProvider,
      razorpay: RazorpayProvider,
      payu: PayUProvider,
      cashfree: CashfreeProvider,
    };
  }

  /**
   * Get a payment provider instance by name
   * @param {string} providerName - The name of the provider
   * @param {object} config - Provider configuration
   * @returns {object} Provider instance
   */
  getProvider(providerName, config = {}) {
    const ProviderClass = this.providers[providerName];

    if (!ProviderClass) {
      throw new Error(`Payment provider "${providerName}" is not supported. Available: ${Object.keys(this.providers).join(', ')}`);
    }

    return new ProviderClass(config);
  }

  /**
   * Get the primary payment provider based on system settings
   * Falls back to ManualUPI if primary is unavailable
   * @param {object} settings - Payment gateway settings from database
   * @returns {object} Provider instance
   */
  getPrimaryProvider(settings = {}) {
    const primaryProvider = settings.primary_provider || 'bharatpe';

    try {
      const provider = this.getProvider(primaryProvider, settings.config || {});
      if (provider.isAvailable()) {
        return provider;
      }
    } catch (error) {
      console.warn(`Primary provider "${primaryProvider}" unavailable: ${error.message}`);
    }

    // Fallback to Manual UPI
    console.info('Falling back to Manual UPI provider');
    return this.getProvider('manual_upi', settings.manual_upi_config || {});
  }

  /**
   * Get list of available providers
   * @returns {string[]} Available provider names
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if a provider is registered
   * @param {string} providerName
   * @returns {boolean}
   */
  hasProvider(providerName) {
    return providerName in this.providers;
  }
}

module.exports = new PaymentProviderFactory();
