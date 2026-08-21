'use client'

import { useRouter } from 'next/navigation'
import { VoiceAgent } from '@/components/VoiceAgent'

export function StudentVoiceAssistant({
  drafts,
}: {
  drafts: { path: string; name: string }[]
}) {
  const router = useRouter()

  return (
    <section
      aria-labelledby="asistente-voz-heading"
      className="paper-shadow mt-8 rounded-lg border border-pacifico/30 border-l-[5px] border-l-pacifico bg-paper-raised p-5"
    >
      <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-pacifico-dark uppercase">
        Asistente IA
      </p>
      <h2 id="asistente-voz-heading" className="mt-1 font-display text-xl font-semibold text-ink">
        Entrega por voz
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Decí qué tarea querés entregar y te llevaré a la pantalla correcta para seleccionar tu PDF.
      </p>

      <div className="mt-4">
        <VoiceAgent
          hint="Ejemplo: “Quiero entregar el informe de Programación Web”."
          onResult={(result) => {
            if (result.action === 'seleccionar_tarea' && result.tareaId) {
              const borrador = result.borradorNombre
                ? drafts.find((draft) => draft.name === result.borradorNombre)
                : null
              const params = new URLSearchParams({ tarea: result.tareaId })
              if (borrador) params.set('borrador', borrador.path)
              router.push(`/dashboard/student/entregar?${params.toString()}`)
            }
          }}
        />
      </div>
    </section>
  )
}
