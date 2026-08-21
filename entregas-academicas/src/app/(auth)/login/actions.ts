'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { dashboardPathForRole } from '@/lib/auth'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? 'No se pudo iniciar sesión.')}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', data.user.id)
    .single()

  redirect(dashboardPathForRole(profile?.rol))
}
