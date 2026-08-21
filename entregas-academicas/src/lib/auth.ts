import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'

type Rol = 'estudiante' | 'profesor' | 'admin'

// Único lugar que mapea rol -> dashboard. Lo usan tanto el login como "/".
export function dashboardPathForRole(rol?: Rol | string | null) {
  if (rol === 'profesor') return '/dashboard/teacher'
  if (rol === 'admin') return '/dashboard/admin'
  return '/dashboard/student'
}

// Guard de rol para Server Components de /dashboard/*. Solo controla qué
// se renderiza (UX); el acceso real a cada tabla y archivo lo decide RLS.
export async function requireRole(rol: Rol) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== rol) redirect('/login')

  return { supabase, user }
}
