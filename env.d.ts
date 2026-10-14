/// <reference types="vite/client" />

// Variables from `.env`. Only `VITE_`-prefixed names are exposed to the app.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
