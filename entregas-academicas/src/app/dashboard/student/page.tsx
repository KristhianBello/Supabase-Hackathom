// Persona 2 — dashboard del estudiante: sus tareas, entregas propias y notas.
// RLS ya restringe todo a sus propias filas; aquí solo se presenta el estado.

import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { FadeUp } from '@/components/motion/fade-up'
import { CourseGrid } from './course-grid'
import { TaskList } from './task-list'
import { btnSecondary, estadoTarea, fetchTareas, type TareaVM } from './helpers'

function resumen(tareas: TareaVM[]): string {
  const conteo: Record<string, number> = { pendiente: 0, entregada: 0, calificada: 0, vencida: 0 }
  for (const t of tareas) {
    const e = estadoTarea(t)
    if (e === 'cerrada') conteo.entregada += 1
    else conteo[e] += 1
  }
  const partes: string[] = []
  if (conteo.pendiente) partes.push(`${conteo.pendiente} pendiente${conteo.pendiente > 1 ? 's' : ''}`)
  if (conteo.entregada) partes.push(`${conteo.entregada} entregada${conteo.entregada > 1 ? 's' : ''}`)
  if (conteo.calificada) partes.push(`${conteo.calificada} calificada${conteo.calificada > 1 ? 's' : ''}`)
  if (conteo.vencida) partes.push(`${conteo.vencida} vencida${conteo.vencida > 1 ? 's' : ''}`)
  return partes.join(' · ')
}

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string }>
}) {
  const { materia: materiaParam } = await searchParams
  const { supabase } = await requireRole('estudiante')
  const { tareas, error } = await fetchTareas(supabase)
  const { data: materiasData } = await supabase
    .from('materias')
    .select('id, nombre')
    .order('nombre')

  const materias = (materiasData ?? []).map((materia) => materia.nombre)
  const materiaSeleccionada = materiaParam && materias.includes(materiaParam) ? materiaParam : null
  const tareasFiltradas = materiaSeleccionada
    ? (tareas ?? []).filter((tarea) => tarea.materia === materiaSeleccionada)
    : []

  // URLs firmadas generadas en servidor (la policy de Storage solo deja
  // firmar archivos dentro de la carpeta del propio estudiante).
  const filas = await Promise.all(
    tareasFiltradas.map(async (tarea) => {
      if (!tarea.entrega) return { tarea, pdfUrl: null }
      const { data } = await supabase.storage
        .from('entregas-alumnos')
        .createSignedUrl(tarea.entrega.archivo_path, 300)
      return { tarea, pdfUrl: data?.signedUrl ?? null }
    }),
  )

  const cursos = materias.map((materia) => ({
    materia,
    total: tareas?.filter((tarea) => tarea.materia === materia).length ?? 0,
    completadas:
      tareas?.filter(
        (tarea) =>
          tarea.materia === materia &&
          ['entregada', 'cerrada', 'calificada'].includes(estadoTarea(tarea)),
      ).length ?? 0,
    activa: materia === materiaSeleccionada,
  }))

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <FadeUp>
        <section id="resumen">
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            Área personal
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {materiaSeleccionada ?? 'Mis cursos'}
          </h1>
          {materiaSeleccionada && tareasFiltradas.length > 0 && (
            <p className="mt-1.5 text-sm text-ink-muted tabular-nums">{resumen(tareasFiltradas)}</p>
          )}
        </section>
      </FadeUp>

      {materias.length > 0 && (
        <section id="materias" aria-labelledby="materias-heading" className="mt-8">
          <FadeUp delay={0.05}>
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
              Vista general de cursos
            </p>
            <h2 id="materias-heading" className="mt-1 font-display text-xl font-semibold text-ink">
              Cursos inscritos
            </h2>
          </FadeUp>
          <CourseGrid courses={cursos} />
        </section>
      )}

      {materiaSeleccionada && (
        <section aria-labelledby="tareas-heading" className="mt-10">
          <h2 id="tareas-heading" className="font-display text-xl font-semibold text-ink">
            Tareas del curso
          </h2>
          {error ? (
            <div className="paper-shadow mt-4 rounded-lg border border-arena bg-paper-raised p-6 text-center">
              <p className="text-sm text-ink">No se pudieron cargar tus tareas.</p>
              <p className="mt-1 font-mono text-xs text-ink-muted">{error}</p>
              <Link href="/dashboard/student" className={`${btnSecondary} mt-4`}>
                Volver a mis cursos
              </Link>
            </div>
          ) : filas.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-arena p-6 text-center text-sm text-ink-muted">
              No hay tareas disponibles en este curso.
            </p>
          ) : (
            <TaskList filas={filas} />
          )}
        </section>
      )}
    </main>
  )
}
