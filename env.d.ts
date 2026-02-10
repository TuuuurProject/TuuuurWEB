/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: {
      success: (message: string) => void
      error: (message: string) => void
      info: (message: string) => void
      warning: (message: string) => void
    }
  }
}
