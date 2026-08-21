// Persona 3 — tareas de una materia. RLS bloquea si la materia no es del profesor.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'

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
      <Link href="/dashboard/teacher" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Mis materias
      </Link>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{materia.nombre}</h1>
      <p className="mt-1 text-sm text-zinc-500">Tareas de esta materia.</p>

      <ul className="mt-6 space-y-3">
        {tareas?.map((tarea) => {
          const vencida = new Date(tarea.fecha_limite) < new Date()
          return (
            <li key={tarea.id}>
              <Link
                href={`/dashboard/teacher/${materiaId}/${tarea.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="font-medium text-zinc-900">{tarea.titulo}</span>
                <span className="flex items-center gap-2 text-sm text-zinc-500">
                  {new Date(tarea.fecha_limite).toLocaleString()}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      vencida ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {vencida ? 'Cerrada' : 'Abierta'}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {tareas?.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          Esta materia todavía no tiene tareas.
        </p>
      )}
    </main>
  )
}
