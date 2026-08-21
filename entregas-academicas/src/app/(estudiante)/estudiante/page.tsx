'use client'

// Persona 2 — dashboard del estudiante: sus propias entregas y notas.
// TODO: query real contra `submissions` + `calificaciones` filtrado por
// el usuario autenticado (RLS ya restringe esto a sus propias filas).

export default function EstudianteDashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Mis entregas</h1>
      <p className="mt-2 text-sm text-zinc-500">TODO(Persona 2): listar entregas y notas propias.</p>
    </main>
  )
}
