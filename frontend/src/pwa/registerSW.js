/**
 * Service Worker Registration
 * Registers the service worker and handles updates
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/)
);

/**
 * Register the service worker
 */
export const register = (config = {}) => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      if (isLocalhost) {
        // In development, check if the service worker exists
        checkValidServiceWorker(swUrl, config);
      } else {
        // In production, register the service worker
        registerValidSW(swUrl, config);
      }
    });
  }
};

/**
 * Register a valid service worker
 */
const registerValidSW = async (swUrl, config) => {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content available
            console.log('New content available; please refresh.');
            if (config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // Content cached for offline use
            console.log('Content cached for offline use.');
            if (config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };
  } catch (error) {
    console.error('Error during service worker registration:', error);
  }
};

/**
 * Check if the service worker is valid (development)
 */
const checkValidServiceWorker = async (swUrl, config) => {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });

    const contentType = response.headers.get('content-type');
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      // No service worker found, reload the page
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      // Service worker found, register it
      registerValidSW(swUrl, config);
    }
  } catch {
    console.log('No internet connection. App running in offline mode.');
  }
};

/**
 * Unregister the service worker
 */
export const unregister = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
    } catch (error) {
      console.error('Error unregistering service worker:', error);
    }
  }
};

export default { register, unregister };
