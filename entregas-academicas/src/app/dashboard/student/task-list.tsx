'use client'

// Persona 2 — lista de tareas animada: las tarjetas entran en cascada y el
// sello de estado "golpea" el papel como un timbre real. La lógica de estado
// (estadoTarea, fechas) es la misma que ya existía; solo se le agregó
// movimiento a la presentación.

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Stamp } from '@/components/Stamp'
import { ClockIcon, DownloadIcon } from '@/components/icons'
import { AnimatedNumber } from '@/components/motion/animated-number'
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  estadoTarea,
  fechaCompleta,
  plazoRelativo,
  venceProximo,
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

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const row: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
}

function TarjetaTarea({ tarea, pdfUrl }: { tarea: TareaVM; pdfUrl: string | null }) {
  const reduceMotion = useReducedMotion()
  const estado = estadoTarea(tarea)
  const entrega = tarea.entrega
  const calificacion = entrega?.calificacion ?? null
  const sello = SELLOS[estado]
  const urgente = estado === 'pendiente' && venceProximo(tarea.fecha_limite)

  return (
    <motion.li
      variants={row}
      className="paper-shadow rounded-lg border border-arena border-l-[5px] border-l-cacao bg-paper-raised p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-medium tracking-tight text-ink [text-wrap:balance]">
            {tarea.titulo}
          </h3>
          <p className="mt-0.5 text-sm text-ink-muted">{tarea.materia}</p>
        </div>
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, scale: 1.7, rotate: 8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 480, damping: 16, delay: reduceMotion ? 0 : 0.2 }}
          className="shrink-0"
        >
          <Stamp tone={sello.tone}>{sello.texto}</Stamp>
        </motion.span>
      </div>

      {tarea.descripcion && (
        <p className="mt-2 text-sm text-ink-muted [text-wrap:pretty]">{tarea.descripcion}</p>
      )}

      <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        <ClockIcon />
        <span className="font-mono text-xs">{fechaCompleta(tarea.fecha_limite)}</span>
        {estado === 'pendiente' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-cacao">
            · {plazoRelativo(tarea.fecha_limite)}
            {urgente && (
              <span className="relative flex size-1.5">
                {!reduceMotion && (
                  <motion.span
                    className="absolute inline-flex size-full rounded-full bg-brick"
                    animate={{ opacity: [0.6, 0], scale: [1, 2.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <span className="relative inline-flex size-1.5 rounded-full bg-brick" />
              </span>
            )}
          </span>
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
              <AnimatedNumber value={calificacion.nota} delay={0.3} />
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
    </motion.li>
  )
}

export function TaskList({
  filas,
}: {
  filas: { tarea: TareaVM; pdfUrl: string | null }[]
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.ul
      variants={container}
      initial={reduceMotion ? 'visible' : 'hidden'}
      animate="visible"
      className="mt-4 space-y-4"
    >
      {filas.map(({ tarea, pdfUrl }) => (
        <TarjetaTarea key={tarea.id} tarea={tarea} pdfUrl={pdfUrl} />
      ))}
    </motion.ul>
  )
}
