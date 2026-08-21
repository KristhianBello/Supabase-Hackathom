// Persona 2

import { login } from './actions'
import { HandWrittenTitle } from '@/components/ui/hand-writing-text'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const folio = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 hidden h-[30rem] w-[30rem] shrink-0 lg:top-1/2 lg:-right-24 lg:block lg:-translate-y-1/2"
      >
        <div className="h-full w-full rounded-full border-[3px] border-cacao/[0.08]" />
        <div className="absolute inset-16 rounded-full border border-dashed border-toquilla/[0.16]" />
        <HandWrittenTitle
          title="Entregas"
          subtitle="académicas"
          className="absolute inset-8 flex items-center justify-center"
          strokeClassName="text-cacao/60"
          titleClassName="font-display text-2xl font-semibold tracking-tight text-cacao md:text-3xl"
          subtitleClassName="font-mono text-xs tracking-[0.14em] text-cacao/70 uppercase md:text-sm"
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-cacao font-display text-xs font-semibold text-cacao">
              EA
            </span>
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
              Entregas académicas · Manabí
            </p>
          </div>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] font-semibold text-ink sm:text-5xl">
            Verificado
            <br />
            fila por fila.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Estudiantes entregan, profesores califican, y cada acceso —autorizado o no— queda
            asentado en el libro de auditoría.
          </p>

          <div className="mt-10 hidden items-center gap-3 lg:flex">
            <span className="h-px w-10 bg-arena" />
            <span className="font-mono text-xs tracking-wide text-ink-muted uppercase">
              Folio {folio}
            </span>
          </div>
        </div>

        <form
          action={login}
          className="paper-shadow rounded-lg border border-arena border-l-[6px] border-l-cacao bg-paper-raised p-8"
        >
          <h2 className="font-display text-xl font-semibold text-ink">Iniciar sesión</h2>
          <p className="mt-1.5 text-sm text-ink-muted">Usá tu correo institucional.</p>

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
