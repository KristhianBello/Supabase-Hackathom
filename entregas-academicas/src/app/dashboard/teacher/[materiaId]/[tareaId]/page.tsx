// Persona 3 — entregas de una tarea: descarga de PDF + calificar.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
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
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← {tarea.materias?.nombre ?? 'Materia'}
      </Link>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{tarea.titulo}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Fecha límite: {new Date(tarea.fecha_limite).toLocaleString()}
      </p>

      <ul className="mt-6 space-y-4">
        {filas.map((entrega) => (
          <li key={entrega.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-900">{entrega.nombreEstudiante}</p>
                <p className="text-sm text-zinc-500">
                  {entrega.archivo_nombre} · entregado el{' '}
                  {new Date(entrega.entregada_at).toLocaleString()}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  entrega.nota != null
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {entrega.nota != null ? `Calificada: ${entrega.nota}` : 'Sin calificar'}
              </span>
            </div>

            {entrega.pdfUrl ? (
              <a
                href={entrega.pdfUrl}
                target="_blank"
                className="mt-2 inline-block text-sm text-blue-600 underline"
              >
                Descargar PDF
              </a>
            ) : (
              <p className="mt-2 text-sm text-red-600">No se pudo generar el enlace de descarga.</p>
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
                className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                required
              />
              <input
                type="text"
                name="comentario"
                placeholder="Comentario (opcional)"
                defaultValue={entrega.comentario}
                className="min-w-48 flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Guardar nota
              </button>
            </form>
          </li>
        ))}

        {filas.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            Todavía no hay entregas.
          </p>
        )}
      </ul>
    </main>
  )
}
