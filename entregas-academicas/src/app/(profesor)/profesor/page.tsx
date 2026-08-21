'use client'

// Persona 3 — dashboard del profesor: sus materias y las entregas recibidas.
// TODO: listar `materias` donde profesor_id = usuario actual, y por materia
// las `submissions` con link de descarga del PDF (Storage) + formulario para
// INSERT/UPDATE en `calificaciones`. RLS ya impide tocar materias ajenas.

export default function ProfesorDashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Mis materias</h1>
      <p className="mt-2 text-sm text-zinc-500">TODO(Persona 3): listar materias, entregas y calificar.</p>
    </main>
  )
}
