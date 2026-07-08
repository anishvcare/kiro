/**
 * Build an absolute URL for uploaded media (request images, bill photos,
 * delivery proofs, etc.).
 *
 * Uploaded files are served by the BACKEND at `/uploads/...`, but the frontend
 * runs on a different origin (Azure Static Web App). A bare `/uploads/...` path
 * would resolve against the frontend origin and 404, so we prefix it with the
 * backend origin (VITE_API_URL without the trailing `/api`).
 *
 * @param {string} path - e.g. "/uploads/requests/abc.jpg" or a full URL
 * @returns {string} absolute URL (or empty string if no path)
 */
export const mediaUrl = (path) => {
  if (!path) return '';
  // Already absolute (http/https or data URI) → return as-is.
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  // Strip a trailing `/api` (and any trailing slash) to get the backend origin.
  const origin = apiUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '');

  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${rel}`;
};

export default mediaUrl;
