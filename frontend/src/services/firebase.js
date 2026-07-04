/**
 * Firebase client initialization for phone-number (SMS OTP) authentication.
 *
 * Configuration is read from Vite env vars (set these in the frontend build
 * environment / .env):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_APP_ID
 *   (optional) VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_STORAGE_BUCKET
 *
 * Firebase Phone Auth delivers the OTP via SMS to the given phone number.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// True only when the essential config is present.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let app = null;
let authInstance = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

export const auth = authInstance;

/**
 * Create (once) an invisible reCAPTCHA verifier bound to a DOM element.
 * Firebase requires a reCAPTCHA to send phone OTPs.
 */
export const getRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  if (!authInstance) throw new Error('Firebase is not configured');
  if (!window._recaptchaVerifier) {
    window._recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
      size: 'invisible',
    });
  }
  return window._recaptchaVerifier;
};

/**
 * Send an OTP SMS to the given E.164 phone number (e.g. +919876543210).
 * Returns a confirmationResult used to confirm the code.
 */
export const sendPhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  if (!authInstance) throw new Error('Firebase is not configured');
  const verifier = getRecaptchaVerifier(containerId);
  return signInWithPhoneNumber(authInstance, phoneNumber, verifier);
};

/**
 * Reset the reCAPTCHA (call on error so the next attempt gets a fresh widget).
 */
export const resetRecaptcha = () => {
  try {
    if (window._recaptchaVerifier) {
      window._recaptchaVerifier.clear();
      window._recaptchaVerifier = null;
    }
  } catch (_e) {
    window._recaptchaVerifier = null;
  }
};

export default { auth: authInstance, isFirebaseConfigured, sendPhoneOtp, getRecaptchaVerifier, resetRecaptcha };
