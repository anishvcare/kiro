const QRCode = require('qrcode');

/**
 * QR Code Service
 * Generates QR codes from UPI deep links and other data
 */

/**
 * Generate a QR code as a data URL (base64 PNG)
 * @param {string} data - The data to encode in the QR code
 * @param {object} options - QR code options
 * @returns {Promise<string>} Base64 data URL of the QR code
 */
const generateQRDataURL = async (data, options = {}) => {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
    ...options,
  };

  try {
    const qrDataURL = await QRCode.toDataURL(data, defaultOptions);
    return qrDataURL;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

/**
 * Generate a QR code from a UPI deep link
 * @param {object} params - UPI payment parameters
 * @returns {Promise<object>} QR code data with metadata
 */
const generateUPIQRCode = async (params) => {
  const { upiId, shopName, amount, requestId, currency = 'INR' } = params;

  if (!upiId || !amount) {
    throw new Error('UPI ID and amount are required for QR code generation');
  }

  const encodedShopName = encodeURIComponent(shopName || 'Shop');
  const encodedTxnNote = encodeURIComponent(requestId || `TXN${Date.now()}`);

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodedShopName}&am=${amount}&cu=${currency}&tn=${encodedTxnNote}`;

  const qrDataURL = await generateQRDataURL(upiLink);

  return {
    qr_code: qrDataURL,
    upi_link: upiLink,
    upi_id: upiId,
    shop_name: shopName,
    amount: parseFloat(amount),
    currency,
    request_id: requestId,
    generated_at: new Date().toISOString(),
  };
};

/**
 * Generate a QR code as SVG string
 * @param {string} data - The data to encode
 * @param {object} options - QR code options
 * @returns {Promise<string>} SVG string
 */
const generateQRSVG = async (data, options = {}) => {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    ...options,
  };

  try {
    const svg = await QRCode.toString(data, { ...defaultOptions, type: 'svg' });
    return svg;
  } catch (error) {
    throw new Error(`Failed to generate QR SVG: ${error.message}`);
  }
};

module.exports = {
  generateQRDataURL,
  generateUPIQRCode,
  generateQRSVG,
};
