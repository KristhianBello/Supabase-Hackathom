'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatTamano, sanitizeFileName } from './helpers'

const MAX_BYTES = 10 * 1024 * 1024

export type DraftVM = {
  path: string
  name: string
  size: number | null
  updatedAt: string | null
}

export function PendingDrafts({
  drafts,
  loadError,
}: {
  drafts: DraftVM[]
  loadError: string | null
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function uploadDraft(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''
    setMessage(null)
    if (!file || uploading) return

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setMessage('Solo podés guardar archivos PDF en tus borradores.')
      return
    }
    if (file.size > MAX_BYTES) {
      setMessage(`El archivo pesa ${formatTamano(file.size)}; el máximo permitido es 10 MB.`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const { error } = await supabase.storage
      .from('borradores-alumnos')
      .upload(`${user.id}/${sanitizeFileName(file.name)}`, file, {
        upsert: true,
        contentType: 'application/pdf',
      })

    if (error) {
      setMessage(`No se pudo guardar el borrador: ${error.message}`)
      setUploading(false)
      return
    }

    setMessage('Borrador guardado. Ya podés asociarlo a una tarea.')
    setUploading(false)
    router.refresh()
  }

  return (
    <section
      aria-labelledby="borradores-heading"
      className="paper-shadow mt-8 rounded-lg border border-toquilla/40 border-l-[5px] border-l-toquilla bg-paper-raised p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-cacao-dark uppercase">
            Almacenamiento personal
          </p>
          <h2 id="borradores-heading" className="mt-1 font-display text-xl font-semibold text-ink">
            Tareas preparadas pendientes de entregar
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Guardá tus PDFs aquí antes de elegir la tarea a la que corresponden.
          </p>
        </div>

        <div>
          <input
            ref={inputRef}
            id="nuevo-borrador"
            type="file"
            accept="application/pdf,.pdf"
            onChange={uploadDraft}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md bg-cacao px-3 py-2 text-sm font-medium text-paper-raised transition-colors hover:bg-cacao-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Guardando…' : 'Guardar PDF'}
          </button>
        </div>
      </div>

      {loadError ? (
        <p className="mt-4 rounded-md border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
          No se pudieron leer tus borradores: {loadError}
        </p>
      ) : drafts.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-arena px-4 py-5 text-center text-sm text-ink-muted">
          Todavía no tenés PDFs pendientes de entregar.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-arena rounded-md border border-arena">
          {drafts.map((draft) => (
            <li key={draft.path} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{draft.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {draft.size != null ? formatTamano(draft.size) : 'PDF'}
                  {draft.updatedAt ? ` · actualizado ${new Date(draft.updatedAt).toLocaleDateString('es-EC')}` : ''}
                </p>
              </div>
              <Link
                href={`/dashboard/student/entregar?borrador=${encodeURIComponent(draft.path)}`}
                className="rounded-md border border-arena px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-cacao hover:text-cacao"
              >
                Entregar ahora
              </Link>
            </li>
          ))}
        </ul>
      )}

      {message && <p className="mt-3 text-sm text-ink-muted">{message}</p>}
    </section>
  )
}
