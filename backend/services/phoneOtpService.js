/**
 * Phone OTP service for WhatsApp-based customer login.
 *
 * Generates, stores and verifies short-lived one-time codes keyed by phone
 * number. Storage is in-memory (a Map) which is fine for a single instance.
 *
 * NOTE: If the backend is scaled to multiple instances or restarts between
 * send and verify, pending codes are lost. For that case, back this with a
 * shared store (Redis / DB table). The public API here stays the same.
 */

const crypto = require('crypto');

const store = new Map(); // phone -> { code, expiresAt, attempts, lastSentAt }

const OTP_TTL_MS = parseInt(process.env.OTP_TTL_MS || '300000', 10); // 5 minutes
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const RESEND_COOLDOWN_MS = parseInt(process.env.OTP_RESEND_COOLDOWN_MS || '30000', 10); // 30s

const generateCode = () => crypto.randomInt(0, 1000000).toString().padStart(6, '0');

/**
 * Create (or refresh) an OTP for a phone number.
 * Throws an error with code 'otp/cooldown' if requested too soon.
 * @param {string} phone - E.164 phone number
 * @returns {string} the generated code
 */
const createOtp = (phone) => {
  const now = Date.now();
  const existing = store.get(phone);

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    const err = new Error(`Please wait ${waitSec} seconds before requesting another code.`);
    err.code = 'otp/cooldown';
    throw err;
  }

  const code = generateCode();
  store.set(phone, { code, expiresAt: now + OTP_TTL_MS, attempts: 0, lastSentAt: now });
  return code;
};

/**
 * Verify a submitted OTP for a phone number. Codes are single-use.
 * @param {string} phone - E.164 phone number
 * @param {string} code - the submitted code
 * @returns {{ valid: boolean, message?: string }}
 */
const verifyOtp = (phone, code) => {
  const rec = store.get(phone);

  if (!rec) {
    return { valid: false, message: 'Code expired or not requested. Please request a new one.' };
  }

  if (Date.now() > rec.expiresAt) {
    store.delete(phone);
    return { valid: false, message: 'Code has expired. Please request a new one.' };
  }

  if (rec.attempts >= MAX_ATTEMPTS) {
    store.delete(phone);
    return { valid: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  rec.attempts += 1;

  if (rec.code !== String(code).trim()) {
    return { valid: false, message: 'Incorrect code. Please try again.' };
  }

  store.delete(phone); // single-use
  return { valid: true };
};

module.exports = { createOtp, verifyOtp };
