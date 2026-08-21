// Persona 2 — subir un PDF a una tarea.
// TODO: elegir tarea (de las materias inscritas), subir a Storage bucket
// `entregas-alumnos` en la ruta {tarea_id}/{estudiante_id}/archivo.pdf vía
// Server Action, luego INSERT en `entregas`. RLS permite UPDATE de la propia
// entrega solo antes de que exista calificación (entrega_sin_calificar) —
// mostrar el error de RLS si se intenta después, no prevalidarlo en el cliente.

import { requireRole } from '@/lib/auth'

export default async function EntregarPage() {
  await requireRole('estudiante')

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Subir entrega</h1>
      <p className="mt-2 text-sm text-zinc-500">TODO(Persona 2): formulario de subida de PDF.</p>
    </main>
  )
}
