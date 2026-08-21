'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { VoiceAgent } from '@/components/VoiceAgent'
import { crearTarea, INITIAL_STATE } from './actions'

function BotonGuardar() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-paper-raised transition-colors hover:bg-cacao-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Asignando…' : 'Asignar tarea'}
    </button>
  )
}

export function CrearTareaForm({ materiaId }: { materiaId: string }) {
  const [state, formAction] = useActionState(crearTarea, INITIAL_STATE)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')

  return (
    <details className="paper-shadow mt-8 rounded-lg border border-arena border-l-[5px] border-l-cacao bg-paper-raised">
      <summary className="cursor-pointer px-5 py-4 font-display text-base font-medium text-ink marker:text-cacao">
        Nueva tarea para esta materia
      </summary>

      <form action={formAction} className="space-y-4 border-t border-arena px-5 py-5">
        <input type="hidden" name="materia_id" value={materiaId} />

        <VoiceAgent
          hint="Decí, por ejemplo: “Crea un ensayo para esta materia, de 700 palabras, para el viernes a las seis”."
          scopeMateriaId={materiaId}
          onResult={(result) => {
            if (result.action !== 'rellenar_tarea') return
            if (result.titulo) setTitulo(result.titulo)
            if (result.descripcion) setDescripcion(result.descripcion)
            if (result.fechaLimite) setFechaLimite(result.fechaLimite)
          }}
        />

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Título</span>
          <input
            name="titulo"
            maxLength={200}
            placeholder="Ej.: Análisis de un caso práctico"
            required
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            className="w-full rounded-md border border-arena bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted/60 focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">
            Instrucciones para el estudiante
          </span>
          <textarea
            name="descripcion"
            rows={5}
            maxLength={5_000}
            placeholder="Explicá qué debe entregar, criterios básicos y formato esperado."
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            className="w-full resize-y rounded-md border border-arena bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted/60 focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
          />
        </label>

        <label className="block max-w-xs">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">
            Fecha límite (Ecuador continental)
          </span>
          <input
            type="datetime-local"
            name="fecha_limite"
            required
            value={fechaLimite}
            onChange={(event) => setFechaLimite(event.target.value)}
            className="w-full rounded-md border border-arena bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-pacifico focus:ring-2 focus:ring-pacifico/30"
          />
        </label>

        {state.error && (
          <p role="alert" className="rounded-md border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-md border border-musgo/30 bg-musgo-soft px-3 py-2 text-sm text-musgo-dark">
            {state.success}
          </p>
        )}

        <div className="flex items-center gap-3">
          <BotonGuardar />
          <span className="text-xs text-ink-muted">Solo la verán los estudiantes inscritos.</span>
        </div>
      </form>
    </details>
  )
}
