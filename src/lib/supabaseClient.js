import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Track whether Supabase is actually configured so the rest of the app
// can gracefully disable auth/storage features instead of crashing.
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.warn(
    '[lumi] Supabase not configured — auth and cloud gallery are disabled.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable them.'
  )
}

// Always create a client — if unconfigured it will exist but all calls
// will fail gracefully (caught in AuthContext and useSupabaseStorage).
export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
