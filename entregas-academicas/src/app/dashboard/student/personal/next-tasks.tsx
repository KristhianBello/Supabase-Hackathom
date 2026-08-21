'use client'

// Persona 2 — lista de "próximas tareas" del área personal, con la misma
// entrada en cascada que el resto de listas del área de estudiante.

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { TareaVM } from '../helpers'

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const row: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
}

export function NextTasks({ tareas }: { tareas: TareaVM[] }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.ul
      variants={container}
      initial={reduceMotion ? 'visible' : 'hidden'}
      animate="visible"
      className="mt-4 divide-y divide-arena overflow-hidden rounded-lg border border-arena bg-paper-raised"
    >
      {tareas.map((tarea) => (
        <motion.li
          key={tarea.id}
          variants={row}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{tarea.titulo}</p>
            <p className="mt-0.5 text-sm text-ink-muted">{tarea.materia}</p>
          </div>
          <Link
            href={`/dashboard/student/entregar?tarea=${tarea.id}`}
            className="shrink-0 rounded-md bg-cacao px-3 py-2 text-sm font-medium text-paper-raised transition-[background-color,transform] duration-150 hover:bg-cacao-dark active:scale-[0.98]"
          >
            Entregar
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  )
}
