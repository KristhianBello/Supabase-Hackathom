import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'

const ROL_LABEL: Record<string, string> = {
  estudiante: 'Estudiante',
  profesor: 'Profesor',
  admin: 'Admin',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('nombre_completo, rol').eq('id', user.id).single()
    : { data: null }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          Entregas Académicas
        </span>

        <div className="flex items-center gap-4">
          {profile && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <span>{profile.nombre_completo}</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                {ROL_LABEL[profile.rol] ?? profile.rol}
              </span>
            </div>
          )}

          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {children}
    </div>
  )
}
