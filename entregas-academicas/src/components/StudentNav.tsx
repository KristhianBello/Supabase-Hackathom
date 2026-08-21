'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export function StudentNav() {
  const pathname = usePathname()
  const enDashboard = pathname === '/dashboard/student'
  const enAreaPersonal = pathname === '/dashboard/student/personal'

  return (
    <nav aria-label="Navegación del estudiante" className="border-b border-arena bg-paper-raised/70">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-6">
        <Link
          href="/"
          className="flex min-h-12 items-center px-3 text-sm text-ink-muted transition-colors hover:bg-arena-soft hover:text-ink"
        >
          Página principal
        </Link>
        <Link
          href="/dashboard/student/personal"
          aria-current={enAreaPersonal ? 'page' : undefined}
          className={`relative flex min-h-12 items-center px-3 text-sm transition-colors ${
            enAreaPersonal ? 'text-paper-raised' : 'text-ink-muted hover:bg-arena-soft hover:text-ink'
          }`}
        >
          {enAreaPersonal && (
            <motion.span
              layoutId="student-nav-active"
              className="absolute inset-0 -z-10 bg-cacao"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
          Área personal
        </Link>
        <Link
          href="/dashboard/student#materias"
          aria-current={enDashboard ? 'page' : undefined}
          className={`relative flex min-h-12 items-center px-3 text-sm font-medium transition-colors duration-150 ${
            enDashboard ? 'text-paper-raised' : 'text-ink-muted hover:bg-arena-soft hover:text-ink'
          }`}
        >
          {enDashboard && (
            <motion.span
              layoutId="student-nav-active"
              className="absolute inset-0 -z-10 bg-cacao"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
          Mis cursos
        </Link>
      </div>
    </nav>
  )
}
