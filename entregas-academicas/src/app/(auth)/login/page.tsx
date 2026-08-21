// Persona 2

import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-cacao font-display text-sm font-semibold text-cacao">
            EA
          </span>
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
              Registro académico
            </p>
            <p className="text-sm text-ink-muted">Entregas Académicas</p>
          </div>
        </div>

        <form
          action={login}
          className="rounded-lg border border-arena border-l-[6px] border-l-cacao bg-paper-raised p-8 shadow-sm"
        >
          <h1 className="font-display text-2xl font-semibold text-ink">Iniciar sesión</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Cada acceso queda registrado.</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Correo</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="w-full rounded-md border border-arena bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted/60 focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Contraseña</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                className="w-full rounded-md border border-arena bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted/60 focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
                required
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-cacao px-3 py-2.5 text-sm font-semibold text-paper-raised transition-colors hover:bg-cacao-dark"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}
