// Persona 3 — dashboard del profesor: sus materias.

import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { FolderIcon } from '@/components/icons'

export default async function TeacherDashboardPage() {
  const { supabase, user } = await requireRole('profesor')

  const { data: materias, error } = await supabase
    .from('materias')
    .select('id, nombre, descripcion')
    .eq('profesor_id', user.id)
    .order('nombre')

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
        Libro de materias
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Mis materias</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Elegí una materia para ver sus tareas y entregas.</p>

      {error && (
        <p className="mt-4 rounded-md border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
          {error.message}
        </p>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {materias?.map((materia) => (
          <li key={materia.id}>
            <Link
              href={`/dashboard/teacher/${materia.id}`}
              className="paper-shadow group flex gap-4 rounded-lg border border-arena border-l-[5px] border-l-cacao bg-paper-raised p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-toquilla-soft text-cacao-dark">
                <FolderIcon />
              </span>
              <div>
                <p className="font-display font-medium text-ink group-hover:text-cacao">
                  {materia.nombre}
                </p>
                {materia.descripcion && (
                  <p className="mt-1 text-sm text-ink-muted">{materia.descripcion}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {materias?.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-arena p-6 text-center text-sm text-ink-muted">
          No tenés materias asignadas todavía.
        </p>
      )}
    </main>
  )
}
