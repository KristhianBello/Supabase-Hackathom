'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
          className={`flex min-h-12 items-center px-3 text-sm transition-colors ${
            enAreaPersonal ? 'bg-cacao text-paper-raised' : 'text-ink-muted hover:bg-arena-soft hover:text-ink'
          }`}
        >
          Área personal
        </Link>
        <Link
          href="/dashboard/student#materias"
          aria-current={enDashboard ? 'page' : undefined}
          className={`relative flex min-h-12 items-center px-3 text-sm font-medium transition-colors duration-150 ${
            enDashboard ? 'bg-cacao text-paper-raised' : 'text-ink-muted hover:bg-arena-soft hover:text-ink'
          }`}
        >
          Mis cursos
        </Link>
      </div>
    </nav>
  )
}
