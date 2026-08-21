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
    <main className="p-8">
      <h1 className="text-xl font-semibold">{materia.nombre}</h1>

      <ul className="mt-4 space-y-2">
        {tareas?.map((tarea) => (
          <li key={tarea.id}>
            <Link
              href={`/dashboard/teacher/${materiaId}/${tarea.id}`}
              className="text-blue-600 underline"
            >
              {tarea.titulo}
            </Link>
            <span className="ml-2 text-sm text-zinc-500">
              Fecha límite: {new Date(tarea.fecha_limite).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      {tareas?.length === 0 && (
        <p className="mt-2 text-sm text-zinc-500">Esta materia todavía no tiene tareas.</p>
      )}
    </main>
  )
}
