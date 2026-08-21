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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Mis materias</h1>
      <p className="mt-1 text-sm text-zinc-500">Elegí una materia para ver sus tareas y entregas.</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {materias?.map((materia) => (
          <li key={materia.id}>
            <Link
              href={`/dashboard/teacher/${materia.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-medium text-zinc-900">{materia.nombre}</p>
              {materia.descripcion && (
                <p className="mt-1 text-sm text-zinc-500">{materia.descripcion}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {materias?.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No tenés materias asignadas todavía.
        </p>
      )}
    </main>
  )
}
