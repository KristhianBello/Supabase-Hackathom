'use client'

// Persona 2 — guard de rol para todas las rutas de estudiante.
// Solo oculta/redirige por UX; el acceso real a los datos lo decide RLS.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function checkAcceso() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', sessionData.session.user.id)
        .single()

      if (profile?.rol !== 'estudiante') {
        router.replace('/login')
        return
      }

      setReady(true)
    }

    checkAcceso()
  }, [router])

  if (!ready) return null

  return <>{children}</>
}
