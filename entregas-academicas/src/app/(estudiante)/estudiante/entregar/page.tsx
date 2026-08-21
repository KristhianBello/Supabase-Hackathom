'use client'

// Persona 2 — subir un PDF a una materia inscrita.
// TODO: seleccionar tarea (de las materias inscritas), subir a Storage bucket
// `entregas-alumnos` en {tarea_id}/{estudiante_id}/archivo.pdf y luego INSERT
// en `entregas`. RLS rechaza el INSERT si ya pasó fecha_limite
// o si no está inscrito — solo hace falta mostrar el error, no prevalidarlo.

export default function EntregarPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Subir entrega</h1>
      <p className="mt-2 text-sm text-zinc-500">TODO(Persona 2): formulario de subida de PDF.</p>
    </main>
  )
}
