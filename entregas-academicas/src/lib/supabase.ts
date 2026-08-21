import { createClient } from './supabase/client'

// Compatibilidad para los Client Components existentes.
// El cliente de @supabase/ssr reutiliza una sola instancia en el navegador.
export const supabase = createClient()
