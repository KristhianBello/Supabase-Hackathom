// Persona 3 — dashboard del profesor: sus materias.

import Link from 'next/link'
import { requireRole } from '@/lib/auth'

export default async function TeacherDashboardPage() {
  const { supabase, user } = await requireRole('profesor')

  const { data: materias, error } = await supabase
    .from('materias')
    .select('id, nombre, descripcion')
    .eq('profesor_id', user.id)
    .order('nombre')

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Mis materias</h1>

      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}

      <ul className="mt-4 space-y-2">
        {materias?.map((materia) => (
          <li key={materia.id}>
            <Link href={`/dashboard/teacher/${materia.id}`} className="text-blue-600 underline">
              {materia.nombre}
            </Link>
            {materia.descripcion && (
              <span className="ml-2 text-sm text-zinc-500">{materia.descripcion}</span>
            )}
          </li>
        ))}
      </ul>

      {materias?.length === 0 && (
        <p className="mt-2 text-sm text-zinc-500">No tienes materias asignadas.</p>
      )}
    </main>
  )
}
