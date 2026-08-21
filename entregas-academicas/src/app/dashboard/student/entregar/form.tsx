'use client'

// Persona 2 — formulario de subida. Flujo: subir a Storage bucket
// `entregas-alumnos` en la ruta {tarea_id}/{estudiante_id}/archivo.pdf y luego
// INSERT (o UPDATE si ya existe) en `entregas`. La subida sale directa del
// navegador para validar en vivo el aislamiento por carpetas; RLS decide si
// la operación es válida y aquí solo se muestra su error.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VoiceAgent } from '@/components/VoiceAgent'
import {
  btnPrimary,
  fechaCompleta,
  formatTamano,
  sanitizeFileName,
  type TareaVM,
} from '../helpers'

const MAX_BYTES = 10 * 1024 * 1024 // coincide con file_size_limit del bucket

function usandoBorradorDisponible(
  archivo: File | null,
  borrador: { path: string; nombre: string } | null,
) {
  return !archivo && !!borrador
}

export function EntregarForm({
  tareas,
  preseleccionId,
  borrador,
}: {
  tareas: TareaVM[]
  preseleccionId: string
  borrador: { path: string; nombre: string } | null
}) {
  const router = useRouter()
  const [tareaId, setTareaId] = useState(preseleccionId)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const tareaSeleccionada = useMemo(
    () => tareas.find((t) => t.id === tareaId) ?? null,
    [tareas, tareaId],
  )

  function elegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const input = e.target
    const f = input.files?.[0] ?? null
    if (!f) {
      setArchivo(null)
      return
    }
    const esPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    if (!esPdf) {
      setError('Solo se aceptan archivos PDF.')
      input.value = ''
      setArchivo(null)
      return
    }
    if (f.size > MAX_BYTES) {
      setError(`El archivo pesa ${formatTamano(f.size)}; el máximo permitido es 10 MB.`)
      input.value = ''
      setArchivo(null)
      return
    }
    setArchivo(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tareaId || (!archivo && !borrador) || enviando) return
    setEnviando(true)
    setError(null)

    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      router.replace('/login')
      return
    }

    const usandoBorrador = !archivo && !!borrador
    let archivoParaSubir: Blob = archivo ?? new Blob()
    let nombreArchivo = archivo?.name ?? borrador?.nombre ?? 'entrega.pdf'

    if (usandoBorrador && borrador) {
      const { data: draftData, error: draftError } = await supabase.storage
        .from('borradores-alumnos')
        .download(borrador.path)

      if (draftError || !draftData) {
        setError(`No se pudo recuperar el borrador: ${draftError?.message ?? 'archivo no encontrado'}`)
        setEnviando(false)
        return
      }

      archivoParaSubir = draftData
      nombreArchivo = borrador.nombre
    }

    const path = `${tareaId}/${user.id}/${sanitizeFileName(nombreArchivo)}`

    const { error: storageError } = await supabase.storage
      .from('entregas-alumnos')
      .upload(path, archivoParaSubir, { upsert: true, contentType: 'application/pdf' })

    if (storageError) {
      setError(`No se pudo subir el archivo: ${storageError.message}`)
      setEnviando(false)
      return
    }

    // RLS solo deja ver la entrega propia; con suerte hay una y toca UPDATE.
    const { data: existente, error: selectError } = await supabase
      .from('entregas')
      .select('id')
      .eq('tarea_id', tareaId)
      .maybeSingle()

    if (selectError) {
      setError(`El archivo subió, pero no se pudo registrar la entrega: ${selectError.message}`)
      setEnviando(false)
      return
    }

    const { error: dbError } = existente
      ? await supabase
          .from('entregas')
          .update({
            archivo_path: path,
            archivo_nombre: nombreArchivo,
            entregada_at: new Date().toISOString(),
          })
          .eq('id', existente.id)
      : await supabase.from('entregas').insert({
          tarea_id: tareaId,
          estudiante_id: user.id,
          archivo_path: path,
          archivo_nombre: nombreArchivo,
        })

    if (dbError) {
      setError(`El archivo subió, pero la entrega fue rechazada: ${dbError.message}`)
      setEnviando(false)
      return
    }

    // El archivo personal se elimina solo después de que Storage y la entrega
    // oficial fueron aceptados. Si falla esta limpieza, la entrega sigue válida.
    if (usandoBorrador && borrador) {
      await supabase.storage.from('borradores-alumnos').remove([borrador.path])
    }

    router.push('/dashboard/student')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="paper-shadow mt-8 space-y-5 rounded-lg border border-arena border-l-[6px] border-l-cacao bg-paper-raised p-6"
    >
      <div className="space-y-1.5">
        <label htmlFor="tarea" className="block text-xs font-medium text-ink-muted">
          Tarea
        </label>
        <select
          id="tarea"
          value={tareaId}
          onChange={(e) => setTareaId(e.target.value)}
          className="w-full rounded-md border border-arena bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
        >
          {tareas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.titulo} — {t.materia}
            </option>
          ))}
        </select>
        {tareaSeleccionada && (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            Límite:{' '}
            <span className="font-mono font-medium">
              {fechaCompleta(tareaSeleccionada.fecha_limite)}
            </span>
          </p>
        )}
      </div>

      {tareaSeleccionada?.entrega && (
        <p className="rounded-md border border-toquilla/40 bg-toquilla-soft px-3 py-2 text-sm text-cacao-dark">
          Ya entregaste esta tarea; subir un nuevo PDF reemplaza el archivo anterior. Solo podés
          hacerlo antes de que sea calificada.
        </p>
      )}

      {borrador && (
        <div className="rounded-md border border-pacifico/30 bg-pacifico-soft px-3 py-2 text-sm text-ink">
          <span className="font-medium">Borrador listo:</span> {borrador.nombre}. Se moverá a la tarea cuando
          confirmes la entrega. Si elegís otro PDF abajo, se usará ese archivo y el borrador se conservará.
        </div>
      )}

      <VoiceAgent
        hint="Decí, por ejemplo: “quiero entregar el informe de Programación Web”."
        onResult={(result) => {
          if (result.action === 'seleccionar_tarea' && result.tareaId) {
            setTareaId(result.tareaId)
            setError(null)
          }
        }}
      />

      <div className="space-y-1.5">
        <label htmlFor="archivo" className="block text-xs font-medium text-ink-muted">
          Archivo PDF
        </label>
        <input
          id="archivo"
          type="file"
          accept="application/pdf,.pdf"
          onChange={elegirArchivo}
          className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-cacao file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper-raised file:transition-colors file:duration-150 hover:file:bg-cacao-dark"
        />
        {archivo ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="min-w-0 truncate">{archivo.name}</span>
            <span className="shrink-0 font-mono text-xs text-ink-muted/70">
              {formatTamano(archivo.size)}
            </span>
          </p>
        ) : (
          <p className="text-xs text-ink-muted/70">Solo PDF, hasta 10 MB.</p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-brick/30 bg-brick-soft px-3 py-2 text-sm break-words text-brick"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={(!archivo && !borrador) || !tareaId || enviando} className={btnPrimary}>
          {enviando && (
            <span className="size-4 animate-spin rounded-full border-2 border-paper-raised/40 border-t-paper-raised" />
          )}
          {enviando
            ? 'Subiendo…'
            : usandoBorradorDisponible(archivo, borrador)
              ? 'Entregar borrador'
              : tareaSeleccionada?.entrega
                ? 'Reemplazar entrega'
                : 'Subir entrega'}
        </button>
        <Link
          href="/dashboard/student"
          className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-arena-soft hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
