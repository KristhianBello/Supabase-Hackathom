// Persona 3 — entregas de una tarea: descarga de PDF + calificar.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { Stamp } from '@/components/Stamp'
import { ClockIcon, DownloadIcon } from '@/components/icons'
import { calificar } from './actions'

export default async function TareaEntregasPage({
  params,
}: {
  params: Promise<{ materiaId: string; tareaId: string }>
}) {
  const { materiaId, tareaId } = await params
  const { supabase } = await requireRole('profesor')

  const { data: tarea } = await supabase
    .from('tareas')
    .select('id, titulo, fecha_limite, materia_id, materias(nombre)')
    .eq('id', tareaId)
    .single()

  // Si RLS bloquea (tarea de otro profesor) esto llega null, igual que si no existe.
  if (!tarea) notFound()

  const { data: entregas } = await supabase
    .from('entregas')
    .select('id, estudiante_id, archivo_path, archivo_nombre, entregada_at')
    .eq('tarea_id', tareaId)
    .order('entregada_at')

  const estudianteIds = (entregas ?? []).map((e) => e.estudiante_id)
  const entregaIds = (entregas ?? []).map((e) => e.id)

  const { data: perfiles } = estudianteIds.length
    ? await supabase.from('profiles').select('id, nombre_completo').in('id', estudianteIds)
    : { data: [] as { id: string; nombre_completo: string }[] }

  const { data: calificaciones } = entregaIds.length
    ? await supabase
        .from('calificaciones')
        .select('entrega_id, nota, comentario')
        .in('entrega_id', entregaIds)
    : { data: [] as { entrega_id: string; nota: number; comentario: string | null }[] }

  const filas = await Promise.all(
    (entregas ?? []).map(async (entrega) => {
      const { data: signed } = await supabase.storage
        .from('entregas-alumnos')
        .createSignedUrl(entrega.archivo_path, 300)

      const calificacion = calificaciones?.find((c) => c.entrega_id === entrega.id)

      return {
        ...entrega,
        nombreEstudiante:
          perfiles?.find((p) => p.id === entrega.estudiante_id)?.nombre_completo ??
          entrega.estudiante_id,
        nota: calificacion?.nota,
        comentario: calificacion?.comentario ?? '',
        pdfUrl: signed?.signedUrl,
      }
    }),
  )

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href={`/dashboard/teacher/${materiaId}`}
        className="text-sm text-ink-muted hover:text-cacao"
      >
        ← {tarea.materias?.nombre ?? 'Materia'}
      </Link>

      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{tarea.titulo}</h1>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
        <ClockIcon />
        Fecha límite: {new Date(tarea.fecha_limite).toLocaleString('es-EC')}
      </p>

      <ul className="mt-8 space-y-4">
        {filas.map((entrega) => (
          <li
            key={entrega.id}
            className="paper-shadow rounded-lg border border-arena border-l-[5px] border-l-cacao bg-paper-raised p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display font-medium text-ink">{entrega.nombreEstudiante}</p>
                <p className="text-sm text-ink-muted">
                  {entrega.archivo_nombre} · entregado el{' '}
                  <span className="font-mono">
                    {new Date(entrega.entregada_at).toLocaleString('es-EC')}
                  </span>
                </p>
              </div>

              <Stamp tone={entrega.nota != null ? 'musgo' : 'toquilla'} className="shrink-0">
                {entrega.nota != null ? `Calificada: ${entrega.nota}` : 'Sin calificar'}
              </Stamp>
            </div>

            {entrega.pdfUrl ? (
              <a
                href={entrega.pdfUrl}
                target="_blank"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-pacifico decoration-pacifico/40 underline-offset-2 hover:text-pacifico-dark hover:underline"
              >
                <DownloadIcon />
                Descargar PDF
              </a>
            ) : (
              <p className="mt-2 text-sm text-brick">No se pudo generar el enlace de descarga.</p>
            )}

            <form action={calificar} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="entrega_id" value={entrega.id} />
              <input type="hidden" name="materia_id" value={materiaId} />
              <input type="hidden" name="tarea_id" value={tareaId} />
              <input
                type="number"
                name="nota"
                step="0.1"
                min={0}
                max={100}
                defaultValue={entrega.nota ?? ''}
                className="w-24 rounded-md border border-arena bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
                required
              />
              <input
                type="text"
                name="comentario"
                placeholder="Comentario (opcional)"
                defaultValue={entrega.comentario}
                className="min-w-48 flex-1 rounded-md border border-arena bg-paper px-2 py-1.5 text-sm text-ink outline-none placeholder:text-ink-muted/60 focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
              />
              <button
                type="submit"
                className="rounded-md bg-cacao px-3 py-1.5 text-sm font-medium text-paper-raised hover:bg-cacao-dark"
              >
                Guardar nota
              </button>
            </form>
          </li>
        ))}

        {filas.length === 0 && (
          <p className="rounded-lg border border-dashed border-arena p-6 text-center text-sm text-ink-muted">
            Todavía no hay entregas.
          </p>
        )}
      </ul>
    </main>
  )
}
