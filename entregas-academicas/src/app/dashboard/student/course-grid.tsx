'use client'

// Persona 2 — grid de cursos animado: entrada escalonada, barra de progreso
// que se llena al montar y una elevación sutil al pasar el mouse. La lógica
// de datos (conteo de tareas, curso activo) sigue viniendo del servidor.

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

const MotionLink = motion.create(Link)

const COURSE_COVERS = ['bg-cacao', 'bg-pacifico', 'bg-toquilla'] as const

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
}

export type CourseCardVM = {
  materia: string
  total: number
  completadas: number
  activa: boolean
}

export function CourseGrid({ courses }: { courses: CourseCardVM[] }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={container}
      initial={reduceMotion ? 'visible' : 'hidden'}
      animate="visible"
      className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {courses.map((course, index) => {
        const pct = course.total > 0 ? Math.round((course.completadas / course.total) * 100) : 0

        return (
          <MotionLink
            key={course.materia}
            href={`/dashboard/student?materia=${encodeURIComponent(course.materia)}`}
            aria-current={course.activa ? 'page' : undefined}
            variants={card}
            whileHover={reduceMotion ? undefined : { y: -5 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="group paper-shadow overflow-hidden rounded-lg border border-arena bg-paper-raised transition-colors duration-150 hover:border-pacifico focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pacifico"
          >
            <span
              className={`flex h-24 items-center justify-center ${course.activa ? 'bg-pacifico' : COURSE_COVERS[index % COURSE_COVERS.length]}`}
            >
              <span className="flex size-12 items-center justify-center rounded-full border border-paper-raised/60 font-display text-xl font-semibold text-paper-raised">
                {course.materia.charAt(0).toUpperCase()}
              </span>
            </span>
            <span className="block p-4">
              <span className="block min-h-12 font-display text-base font-semibold leading-snug text-ink group-hover:text-pacifico [text-wrap:balance]">
                {course.materia}
              </span>
              <span className="mt-3 flex items-center justify-between border-t border-arena pt-3 text-xs text-ink-muted">
                <span>
                  {course.total} tarea{course.total === 1 ? '' : 's'}
                </span>
                <span className="tabular-nums">
                  {course.completadas}/{course.total} entregadas
                </span>
              </span>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-arena">
                <motion.span
                  className={`block h-full rounded-full ${course.activa ? 'bg-pacifico' : 'bg-cacao'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.9,
                    delay: reduceMotion ? 0 : 0.35 + index * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </span>
            </span>
          </MotionLink>
        )
      })}
    </motion.div>
  )
}
