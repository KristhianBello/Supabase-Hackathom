// Persona 3 — tareas de una materia. RLS bloquea si la materia no es del profesor.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { Stamp } from '@/components/Stamp'
import { ClockIcon } from '@/components/icons'

export default async function MateriaTareasPage({
  params,
}: {
  params: Promise<{ materiaId: string }>
}) {
  const { materiaId } = await params
  const { supabase } = await requireRole('profesor')

  const { data: materia } = await supabase
    .from('materias')
    .select('id, nombre')
    .eq('id', materiaId)
    .single()

  if (!materia) notFound()

  const { data: tareas } = await supabase
    .from('tareas')
    .select('id, titulo, fecha_limite')
    .eq('materia_id', materiaId)
    .order('fecha_limite')

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/dashboard/teacher" className="text-sm text-ink-muted hover:text-cacao">
        ← Mis materias
      </Link>

      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{materia.nombre}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Tareas ordenadas por fecha límite, como asientos en un libro.
      </p>

      {/* Orden cronológica real (fecha_limite) — la línea de tiempo encierra
          esa información, no la decora. */}
      <ol className="relative mt-8 border-l-2 border-arena pl-8">
        {tareas?.map((tarea) => {
          const vencida = new Date(tarea.fecha_limite) < new Date()
          return (
            <li key={tarea.id} className="relative mb-4 last:mb-0">
              <span
                className={`absolute -left-[41px] mt-6 h-4 w-4 rounded-full border-2 border-paper ${
                  vencida ? 'bg-ink-muted' : 'bg-musgo'
                }`}
              />
              <Link
                href={`/dashboard/teacher/${materiaId}/${tarea.id}`}
                className="paper-shadow flex items-center justify-between rounded-lg border border-arena bg-paper-raised p-5 transition-transform hover:-translate-y-0.5"
              >
                <span className="font-display font-medium text-ink">{tarea.titulo}</span>
                <span className="flex items-center gap-3 text-sm text-ink-muted">
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <ClockIcon />
                    {new Date(tarea.fecha_limite).toLocaleString()}
                  </span>
                  <Stamp tone={vencida ? 'ink' : 'musgo'}>{vencida ? 'Cerrada' : 'Abierta'}</Stamp>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      {tareas?.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-arena p-6 text-center text-sm text-ink-muted">
          Esta materia todavía no tiene tareas.
        </p>
      )}
    </main>
  )
}
