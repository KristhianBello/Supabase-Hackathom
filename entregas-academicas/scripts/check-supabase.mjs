import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  console.error('Faltan las variables publicas de Supabase en .env.local.')
  process.exit(1)
}

const supabase = createClient(url, publishableKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data, error } = await supabase.rpc('health_check')

if (error || data?.status !== 'ok') {
  console.error('No se pudo conectar con Supabase.', error?.code ?? '')
  process.exit(1)
}

console.log('Conexion con Supabase verificada.')
