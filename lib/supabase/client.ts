import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getMissingSupabaseEnvVars() {
  const missing: string[] = []
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return missing
}

export function createClient() {
  const missingEnvVars = getMissingSupabaseEnvVars()
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required Supabase env var(s): ${missingEnvVars.join(', ')}`)
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
