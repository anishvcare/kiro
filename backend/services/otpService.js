/**
 * OTP Service - Generate and validate OTPs for delivery verification
 */

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

// OTP expiry time in milliseconds (10 minutes)
const OTP_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Generate a 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and store an OTP for a delivery assignment
 * @param {string} assignmentId - The delivery assignment ID
 * @param {string} customerId - The customer ID for validation
 * @returns {string} The generated OTP
 */
const createDeliveryOTP = (assignmentId, customerId) => {
  const otp = generateOTP();
  const key = `delivery_${assignmentId}`;

  otpStore.set(key, {
    otp,
    customerId,
    assignmentId,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    verified: false,
  });

  return otp;
};

/**
 * Validate an OTP for a delivery assignment
 * @param {string} assignmentId - The delivery assignment ID
 * @param {string} otp - The OTP to validate
 * @returns {object} { valid: boolean, message: string }
 */
const validateDeliveryOTP = (assignmentId, otp) => {
  const key = `delivery_${assignmentId}`;
  const stored = otpStore.get(key);

  if (!stored) {
    return { valid: false, message: 'No OTP found for this delivery. Please request a new one.' };
  }

  if (stored.verified) {
    return { valid: false, message: 'OTP has already been used.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  // Mark as verified
  stored.verified = true;
  otpStore.set(key, stored);

  return { valid: true, message: 'OTP verified successfully.' };
};

/**
 * Get the active OTP for an assignment, creating one if none exists yet.
 * Returns the actual OTP so the customer can show it to the delivery boy.
 */
const getActiveOTP = (assignmentId, customerId = 'customer') => {
  const key = `delivery_${assignmentId}`;
  const stored = otpStore.get(key);
  if (!stored || stored.verified || Date.now() > stored.expiresAt) {
    return createDeliveryOTP(assignmentId, customerId);
  }
  return stored.otp;
};

/**
 * Get OTP details for an assignment (without revealing the actual OTP)
 * @param {string} assignmentId - The delivery assignment ID
 * @returns {object|null} OTP metadata
 */
const getOTPStatus = (assignmentId) => {
  const key = `delivery_${assignmentId}`;
  const stored = otpStore.get(key);

  if (!stored) {
    return null;
  }

  return {
    assignmentId: stored.assignmentId,
    createdAt: stored.createdAt,
    expiresAt: stored.expiresAt,
    verified: stored.verified,
    expired: Date.now() > stored.expiresAt,
  };
};

/**
 * Invalidate an OTP for an assignment
 * @param {string} assignmentId - The delivery assignment ID
 */
const invalidateOTP = (assignmentId) => {
  const key = `delivery_${assignmentId}`;
  otpStore.delete(key);
};

/**
 * Cleanup expired OTPs (call periodically)
 */
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
    }
  }
};

// Cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
  generateOTP,
  createDeliveryOTP,
  getActiveOTP,
  validateDeliveryOTP,
  getOTPStatus,
  invalidateOTP,
  cleanupExpiredOTPs,
};
