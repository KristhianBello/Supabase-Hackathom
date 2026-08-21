// Persona 3 — tareas de una materia. RLS bloquea si la materia no es del profesor.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { Stamp } from '@/components/Stamp'

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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/dashboard/teacher" className="text-sm text-ink-muted hover:text-cacao">
        ← Mis materias
      </Link>

      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{materia.nombre}</h1>
      <p className="mt-1 text-sm text-ink-muted">Tareas de esta materia.</p>

      <ul className="mt-6 space-y-3">
        {tareas?.map((tarea) => {
          const vencida = new Date(tarea.fecha_limite) < new Date()
          return (
            <li key={tarea.id}>
              <Link
                href={`/dashboard/teacher/${materiaId}/${tarea.id}`}
                className="flex items-center justify-between rounded-lg border border-arena border-l-[5px] border-l-cacao bg-paper-raised p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="font-display font-medium text-ink">{tarea.titulo}</span>
                <span className="flex items-center gap-3 text-sm text-ink-muted">
                  <span className="font-mono text-xs">{new Date(tarea.fecha_limite).toLocaleString()}</span>
                  <Stamp tone={vencida ? 'ink' : 'musgo'}>{vencida ? 'Cerrada' : 'Abierta'}</Stamp>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {tareas?.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-arena p-6 text-center text-sm text-ink-muted">
          Esta materia todavía no tiene tareas.
        </p>
      )}
    </main>
  )
}
