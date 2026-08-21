import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { FadeUp } from '@/components/motion/fade-up'
import { AnimatedNumber } from '@/components/motion/animated-number'
import { estadoTarea, fetchTareas, type TareaVM } from '../helpers'
import { NextTasks } from './next-tasks'

function contar(tareas: TareaVM[], estados: string[]) {
  return tareas.filter((tarea) => estados.includes(estadoTarea(tarea))).length
}

export default async function StudentPersonalPage() {
  const { supabase } = await requireRole('estudiante')
  const { tareas, error } = await fetchTareas(supabase)
  const lista = tareas ?? []
  const pendientes = contar(lista, ['pendiente', 'vencida'])
  const entregadas = contar(lista, ['entregada', 'cerrada'])
  const calificadas = contar(lista, ['calificada'])
  const proximas = lista.filter((tarea) => estadoTarea(tarea) === 'pendiente').slice(0, 3)

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <FadeUp>
        <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Área personal
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Resumen de actividad</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Tu progreso y las tareas que requieren atención.</p>
      </FadeUp>

      {error ? (
        <p className="mt-8 rounded-md border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
          No se pudo cargar tu resumen: {error}
        </p>
      ) : (
        <>
          <FadeUp delay={0.08}>
            <section aria-label="Resumen de tareas" className="mt-8 grid grid-cols-3 gap-3 max-[639px]:grid-cols-1">
              <div className="paper-shadow flex items-center justify-between rounded-lg border border-arena border-l-4 border-l-toquilla bg-paper-raised px-4 py-3">
                <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase">Pendientes</p>
                <p className="font-display text-2xl font-semibold text-ink tabular-nums">
                  <AnimatedNumber value={pendientes} delay={0.2} />
                </p>
              </div>
              <div className="paper-shadow flex items-center justify-between rounded-lg border border-arena border-l-4 border-l-pacifico bg-paper-raised px-4 py-3">
                <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase">Entregadas</p>
                <p className="font-display text-2xl font-semibold text-ink tabular-nums">
                  <AnimatedNumber value={entregadas} delay={0.3} />
                </p>
              </div>
              <div className="paper-shadow flex items-center justify-between rounded-lg border border-arena border-l-4 border-l-musgo bg-paper-raised px-4 py-3">
                <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase">Calificadas</p>
                <p className="font-display text-2xl font-semibold text-ink tabular-nums">
                  <AnimatedNumber value={calificadas} delay={0.4} />
                </p>
              </div>
            </section>
          </FadeUp>

          <section aria-labelledby="proximas-heading" className="mt-8">
            <FadeUp delay={0.15}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">Seguimiento</p>
                  <h2 id="proximas-heading" className="mt-1 font-display text-xl font-semibold text-ink">Próximas tareas</h2>
                </div>
                <Link href="/dashboard/student" className="text-sm font-medium text-cacao hover:text-cacao-dark">
                  Ver mis cursos →
                </Link>
              </div>
            </FadeUp>

            {proximas.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-arena p-6 text-center text-sm text-ink-muted">
                No tienes tareas pendientes.
              </p>
            ) : (
              <NextTasks tareas={proximas} />
            )}
          </section>
        </>
      )}
    </main>
  )
}
