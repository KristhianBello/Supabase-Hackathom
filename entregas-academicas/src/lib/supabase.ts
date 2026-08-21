import { createClient } from '@supabase/supabase-js'
// import type { Database } from './database.types' — descomentar cuando
// database.types.ts tenga los tipos reales generados (ver ese archivo).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente único para toda la app. Usa la anon key: la seguridad real la
// impone RLS en Postgres, no este archivo. Importar desde Client Components.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
