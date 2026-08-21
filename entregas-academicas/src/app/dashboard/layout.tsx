import { createClient } from '@/lib/supabase/server'
import { Stamp } from '@/components/Stamp'
import { StudentNav } from '@/components/StudentNav'
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
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
          {/* En mobile, sm:contents "aplana" este div: EA y el botón de
              salir pasan a ser hijos directos del flex del header, así se
              pueden reordenar junto al nombre en una sola fila desde sm+. */}
          <div className="flex items-center justify-between gap-3 sm:contents">
            <div className="flex min-w-0 items-center gap-2.5 sm:order-1">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-cacao font-display text-xs font-semibold text-cacao">
                EA
              </span>
              <span className="truncate font-display text-sm font-semibold tracking-tight text-ink max-sm:hidden">
                Entregas Académicas
              </span>
            </div>

            <form action={logout} className="sm:order-3">
              <button
                type="submit"
                className="shrink-0 rounded-md border border-arena px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-ink-muted transition-colors hover:border-cacao hover:text-cacao sm:px-3"
              >
                <span className="sm:hidden">Salir</span>
                <span className="max-sm:hidden">Cerrar sesión</span>
              </button>
            </form>
          </div>

          {profile && (
            <div className="flex min-w-0 items-center gap-2 sm:order-2 sm:ml-auto">
              <span className="truncate text-sm text-ink-muted sm:max-w-32 lg:max-w-none">
                {profile.nombre_completo}
              </span>
              <Stamp tone={ROL_TONE[profile.rol] ?? 'ink'} className="shrink-0">
                {ROL_LABEL[profile.rol] ?? profile.rol}
              </Stamp>
            </div>
          )}
        </div>
        <div className="letterhead-bar h-[3px]" />
      </header>

      {profile?.rol === 'estudiante' && <StudentNav />}

      {children}
    </div>
  )
}
