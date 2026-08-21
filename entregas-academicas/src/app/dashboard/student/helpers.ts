// Helpers compartidos de la vista de estudiante (dashboard + subida de entregas).
// Los datos ya vienen filtrados por RLS: el estudiante solo ve tareas de sus
// materias inscritas, sus propias entregas y sus propias calificaciones.
// Este módulo no importa supabase en runtime para poder usarlo también
// desde Client Components; el cliente llega por parámetro.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export type CalificacionVM = {
  nota: number
  comentario: string | null
}

export type EntregaVM = {
  id: string
  archivo_path: string
  archivo_nombre: string
  entregada_at: string
  calificacion: CalificacionVM | null
}

export type TareaVM = {
  id: string
  titulo: string
  descripcion: string | null
  fecha_limite: string
  materia: string
  entrega: EntregaVM | null
}

// PostgREST puede devolver una relación como objeto o como array según la
// cardinalidad; RLS garantiza que aquí hay como máximo una fila por relación.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

const SELECT_TAREAS =
  'id, titulo, descripcion, fecha_limite, materias(nombre), entregas(id, archivo_path, archivo_nombre, entregada_at, calificaciones(nota, comentario))'

export async function fetchTareas(
  supabase: SupabaseClient<Database>,
): Promise<{
  tareas: TareaVM[] | null
  error: string | null
}> {
  const { data, error } = await supabase
    .from('tareas')
    .select(SELECT_TAREAS)
    .order('fecha_limite', { ascending: true })

  if (error) return { tareas: null, error: error.message }

  const tareas: TareaVM[] = (data ?? []).map((t) => {
    const materia = one(t.materias)
    const entrega = one(t.entregas)
    const calificacion = entrega ? one(entrega.calificaciones) : null

    return {
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      fecha_limite: t.fecha_limite,
      materia: materia?.nombre ?? 'Materia',
      entrega: entrega
        ? {
            id: entrega.id,
            archivo_path: entrega.archivo_path,
            archivo_nombre: entrega.archivo_nombre,
            entregada_at: entrega.entregada_at,
            calificacion: calificacion
              ? { nota: calificacion.nota, comentario: calificacion.comentario }
              : null,
          }
        : null,
    }
  })

  return { tareas, error: null }
}

export type EstadoTarea = 'pendiente' | 'entregada' | 'cerrada' | 'vencida' | 'calificada'

export function estadoTarea(t: TareaVM, ahora = new Date()): EstadoTarea {
  if (t.entrega?.calificacion) return 'calificada'
  const vencida = new Date(t.fecha_limite).getTime() < ahora.getTime()
  if (t.entrega) return vencida ? 'cerrada' : 'entregada'
  return vencida ? 'vencida' : 'pendiente'
}

const fmtCompleta = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function fechaCompleta(iso: string): string {
  return fmtCompleta.format(new Date(iso))
}

export function plazoRelativo(iso: string, ahora = new Date()): string {
  const ms = new Date(iso).getTime() - ahora.getTime()
  const abs = Math.abs(ms)
  const minutos = Math.round(abs / 60_000)
  const horas = Math.round(abs / 3_600_000)
  const dias = Math.round(abs / 86_400_000)
  const cantidad = dias >= 2 ? `${dias} días` : horas >= 2 ? `${horas} h` : `${Math.max(minutos, 1)} min`
  return ms >= 0 ? `vence en ${cantidad}` : `venció hace ${cantidad}`
}

// La policy de Storage exige path {tarea_id}/{estudiante_id}/{archivo}.pdf en
// minúsculas; normalizamos el nombre para que siempre cumpla el formato.
export function sanitizeFileName(name: string): string {
  const sinAcentos = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const limpio = sinAcentos
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const conPdf = limpio.endsWith('.pdf') ? limpio : `${limpio}.pdf`
  return conPdf === '.pdf' ? 'entrega.pdf' : conPdf
}

export function formatTamano(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Clases de botones compartidas para mantener una sola fuente visual.
export const btnPrimary =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cacao px-4 text-sm font-medium text-paper-raised transition-[background-color,transform,opacity] duration-150 hover:bg-cacao-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transform-none'

export const btnSecondary =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-arena bg-paper-raised px-4 text-sm font-medium text-ink transition-[background-color,border-color,color,transform,opacity] duration-150 hover:border-cacao hover:text-cacao active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transform-none'

export const btnGhost =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-arena-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-60'
