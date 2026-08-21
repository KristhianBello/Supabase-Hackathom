// Persona 2 — dashboard del estudiante: sus tareas, entregas propias y notas.
// RLS ya restringe todo a sus propias filas; aquí solo se presenta el estado.

import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { Stamp } from '@/components/Stamp'
import { ClockIcon, DownloadIcon } from '@/components/icons'
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  estadoTarea,
  fechaCompleta,
  fetchTareas,
  plazoRelativo,
  type EstadoTarea,
  type TareaVM,
} from './helpers'

type StampTone = 'cacao' | 'toquilla' | 'pacifico' | 'musgo' | 'brick' | 'ink'

const SELLOS: Record<EstadoTarea, { texto: string; tone: StampTone }> = {
  pendiente: { texto: 'Pendiente', tone: 'toquilla' },
  entregada: { texto: 'Entregada', tone: 'pacifico' },
  cerrada: { texto: 'Entregada', tone: 'ink' },
  vencida: { texto: 'Vencida', tone: 'brick' },
  calificada: { texto: 'Calificada', tone: 'musgo' },
}

const COURSE_COVERS = ['bg-cacao', 'bg-pacifico', 'bg-toquilla'] as const

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

function TarjetaTarea({ tarea, pdfUrl }: { tarea: TareaVM; pdfUrl: string | null }) {
  const estado = estadoTarea(tarea)
  const entrega = tarea.entrega
  const calificacion = entrega?.calificacion ?? null
  const sello = SELLOS[estado]

  return (
    <li className="paper-shadow rounded-lg border border-arena border-l-[5px] border-l-cacao bg-paper-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-medium tracking-tight text-ink [text-wrap:balance]">
            {tarea.titulo}
          </h3>
          <p className="mt-0.5 text-sm text-ink-muted">{tarea.materia}</p>
        </div>
        <Stamp tone={sello.tone} className="shrink-0">
          {sello.texto}
        </Stamp>
      </div>

      {tarea.descripcion && (
        <p className="mt-2 text-sm text-ink-muted [text-wrap:pretty]">{tarea.descripcion}</p>
      )}

      <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        <ClockIcon />
        <span className="font-mono text-xs">{fechaCompleta(tarea.fecha_limite)}</span>
        {estado === 'pendiente' && (
          <span className="text-xs text-cacao">· {plazoRelativo(tarea.fecha_limite)}</span>
        )}
      </p>

      {entrega && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-arena bg-paper px-3 py-2 text-sm text-ink-muted">
          <span className="min-w-0 truncate">{entrega.archivo_nombre}</span>
          <span className="font-mono text-xs text-ink-muted/70">
            · {fechaCompleta(entrega.entregada_at)}
          </span>
        </div>
      )}

      {estado === 'calificada' && calificacion && (
        <div className="mt-4 border-t border-dashed border-arena pt-3">
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            Calificación
          </p>
          <p className="mt-1">
            <span className="font-display text-3xl font-semibold tracking-tight text-brick tabular-nums">
              {calificacion.nota}
            </span>
            <span className="ml-1 text-sm text-ink-muted">/ 100</span>
          </p>
          {calificacion.comentario && (
            <p className="mt-1 text-sm text-ink-muted italic [text-wrap:pretty]">
              “{calificacion.comentario}”
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {estado === 'pendiente' && (
          <Link href={`/dashboard/student/entregar?tarea=${tarea.id}`} className={btnPrimary}>
            Entregar
          </Link>
        )}
        {estado === 'entregada' && (
          <Link href={`/dashboard/student/entregar?tarea=${tarea.id}`} className={btnSecondary}>
            Reemplazar entrega
          </Link>
        )}
        {entrega &&
          (pdfUrl ? (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>
              <DownloadIcon />
              Ver PDF
            </a>
          ) : (
            <span className="text-sm text-brick">No se pudo generar el enlace del PDF.</span>
          ))}
      </div>
    </li>
  )
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

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
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

      {materias.length > 0 && (
        <section id="materias" aria-labelledby="materias-heading" className="mt-8">
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            Vista general de cursos
          </p>
          <h2 id="materias-heading" className="mt-1 font-display text-xl font-semibold text-ink">
            Cursos inscritos
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {materias.map((materia, index) => {
              const total = tareas?.filter((tarea) => tarea.materia === materia).length ?? 0
              const completadas =
                tareas?.filter(
                  (tarea) =>
                    tarea.materia === materia &&
                    ['entregada', 'cerrada', 'calificada'].includes(estadoTarea(tarea)),
                ).length ?? 0
              const activa = materia === materiaSeleccionada

              return (
                <Link
                  key={materia}
                  href={`/dashboard/student?materia=${encodeURIComponent(materia)}`}
                  aria-current={activa ? 'page' : undefined}
                  className="group paper-shadow overflow-hidden rounded-lg border border-arena bg-paper-raised transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-pacifico focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pacifico active:scale-[0.99]"
                >
                  <span className={`flex h-24 items-center justify-center ${activa ? 'bg-pacifico' : COURSE_COVERS[index % COURSE_COVERS.length]}`}>
                    <span className="flex size-12 items-center justify-center rounded-full border border-paper-raised/60 font-display text-xl font-semibold text-paper-raised">
                      {materia.charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <span className="block p-4">
                    <span className="block min-h-12 font-display text-base font-semibold leading-snug text-ink group-hover:text-pacifico [text-wrap:balance]">
                      {materia}
                    </span>
                    <span className="mt-3 flex items-center justify-between border-t border-arena pt-3 text-xs text-ink-muted">
                      <span>{total} tarea{total === 1 ? '' : 's'}</span>
                      <span>{completadas}/{total} entregadas</span>
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
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
            <ul className="mt-4 space-y-4">
              {filas.map(({ tarea, pdfUrl }) => (
                <TarjetaTarea key={tarea.id} tarea={tarea} pdfUrl={pdfUrl} />
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}
