import { createClient } from '@supabase/supabase-js'

const supabaseUrl    = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// In development, warn loudly if env vars are missing so it's impossible to miss.
// In production a misconfigured deploy will surface errors from every Supabase call
// rather than silently using placeholder values.
if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    '[lumi] Missing Supabase credentials.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.\n' +
    'Copy .env.example to .env.local and fill in the values from your Supabase project.'
  if (import.meta.env.DEV) {
    // Throw in dev so the developer sees a clear error overlay immediately
    throw new Error(msg)
  } else {
    console.error(msg)
  }
}

export const supabase = createClient(
  supabaseUrl  ?? '',
  supabaseAnonKey ?? ''
)
