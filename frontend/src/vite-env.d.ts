/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface GoogleTokenResponse {
  access_token?: string
  error?: string
}

interface GoogleTokenClient {
  requestAccessToken: () => void
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: GoogleTokenResponse) => void
  }) => GoogleTokenClient
}

interface GoogleAccounts {
  oauth2: GoogleOAuth2
}

interface GoogleApi {
  accounts: GoogleAccounts
}

declare global {
  interface Window {
    google?: GoogleApi
  }
}

export {}
