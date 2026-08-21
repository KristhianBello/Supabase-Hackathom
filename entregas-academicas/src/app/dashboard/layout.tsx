import { createClient } from '@/lib/supabase/server'
import { Stamp } from '@/components/Stamp'
import { logout } from './actions'

const ROL_LABEL: Record<string, string> = {
  estudiante: 'Estudiante',
  profesor: 'Profesor',
  admin: 'Admin',
}

const ROL_TONE: Record<string, 'pacifico' | 'toquilla' | 'ink'> = {
  estudiante: 'pacifico',
  profesor: 'toquilla',
  admin: 'ink',
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-arena bg-paper-raised/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-cacao font-display text-xs font-semibold text-cacao">
              EA
            </span>
            <span className="font-display text-sm font-semibold tracking-tight text-ink">
              Entregas Académicas
            </span>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">{profile.nombre_completo}</span>
                <Stamp tone={ROL_TONE[profile.rol] ?? 'ink'}>
                  {ROL_LABEL[profile.rol] ?? profile.rol}
                </Stamp>
              </div>
            )}

            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-arena px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-cacao hover:text-cacao"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
        <div className="letterhead-bar h-[3px]" />
      </header>

      {children}
    </div>
  )
}
