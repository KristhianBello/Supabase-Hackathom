// Persona 2 — subir un PDF a una tarea inscrita.
// El guard de rol y la carga de tareas van en servidor; la subida del archivo
// sale directa del navegador al bucket privado (ver form.tsx). RLS rechaza la
// operación si pasó fecha_limite, si no está inscrito o si la entrega ya fue
// calificada — solo hace falta mostrar el error.

import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { estadoTarea, fetchTareas } from '../helpers'
import { EntregarForm } from './form'

export default async function EntregarPage({
  searchParams,
}: {
  searchParams: Promise<{ tarea?: string }>
}) {
  const { tarea: tareaParam } = await searchParams
  const { supabase } = await requireRole('estudiante')
  const { tareas, error } = await fetchTareas(supabase)

  // Entregable = dentro de plazo y (sin entrega o entrega aún sin calificar).
  const entregables = (tareas ?? []).filter((t) => {
    const estado = estadoTarea(t)
    return estado === 'pendiente' || estado === 'entregada'
  })

  const preseleccionId =
    entregables.find((t) => t.id === tareaParam)?.id ?? entregables[0]?.id ?? ''

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/dashboard/student" className="text-sm text-ink-muted hover:text-cacao">
        ← Volver a mis entregas
      </Link>

      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Subir entrega</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        El PDF se guarda en tu carpeta privada de la tarea.
      </p>

      {error ? (
        <div className="paper-shadow mt-8 rounded-lg border border-arena bg-paper-raised p-6 text-center">
          <p className="text-sm text-ink">No se pudieron cargar tus tareas.</p>
          <p className="mt-1 font-mono text-xs text-ink-muted">{error}</p>
        </div>
      ) : entregables.length === 0 ? (
        <div className="paper-shadow mt-8 rounded-lg border border-arena bg-paper-raised p-10 text-center">
          <p className="text-sm font-medium text-ink">No hay tareas disponibles para entregar</p>
          <p className="mt-1 text-sm text-ink-muted">
            Todas tus tareas están vencidas o ya fueron calificadas.
          </p>
          <Link
            href="/dashboard/student"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-cacao px-4 text-sm font-medium text-paper-raised transition-colors hover:bg-cacao-dark"
          >
            Volver a mis entregas
          </Link>
        </div>
      ) : (
        <EntregarForm tareas={entregables} preseleccionId={preseleccionId} />
      )}
    </main>
  )
}
