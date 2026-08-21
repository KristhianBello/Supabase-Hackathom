'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type CrearTareaState = {
  error?: string
  success?: string
}

const INITIAL_STATE: CrearTareaState = {}

export { INITIAL_STATE }

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? '').trim()
}

export async function crearTarea(
  _previousState: CrearTareaState,
  formData: FormData,
): Promise<CrearTareaState> {
  const materiaId = texto(formData, 'materia_id')
  const titulo = texto(formData, 'titulo')
  const descripcion = texto(formData, 'descripcion')
  const fechaLocal = texto(formData, 'fecha_limite')

  if (!materiaId || !titulo || !fechaLocal) {
    return { error: 'Completá el título y la fecha límite.' }
  }

  if (titulo.length > 200 || descripcion.length > 5_000) {
    return { error: 'El título o las instrucciones son demasiado extensos.' }
  }

  // La institución trabaja en Ecuador continental (UTC-5). `datetime-local`
  // no envía una zona horaria, por eso la fijamos antes de guardar el instante.
  const fechaLimite = new Date(`${fechaLocal}:00-05:00`)
  if (Number.isNaN(fechaLimite.getTime()) || fechaLimite <= new Date()) {
    return { error: 'Elegí una fecha límite futura y válida.' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Tu sesión venció. Volvé a iniciar sesión.' }

    // Esta comprobación mejora el mensaje de la interfaz. La política RLS de
    // `tareas` sigue siendo la autoridad que impide crear tareas ajenas.
    const { data: materia, error: materiaError } = await supabase
      .from('materias')
      .select('id')
      .eq('id', materiaId)
      .eq('profesor_id', user.id)
      .maybeSingle()

    if (materiaError) {
      console.error('crearTarea: no se pudo validar la materia', materiaError)
      return { error: 'No se pudo validar la materia. Intentá nuevamente.' }
    }

    if (!materia) {
      return { error: 'No tenés autorización para asignar una tarea en esta materia.' }
    }

    const { error } = await supabase.from('tareas').insert({
      materia_id: materiaId,
      titulo,
      descripcion: descripcion || null,
      fecha_limite: fechaLimite.toISOString(),
    })

    if (error) {
      console.error('crearTarea: no se pudo insertar la tarea', error)
      return { error: `No se pudo crear la tarea: ${error.message}` }
    }

    revalidatePath(`/dashboard/teacher/${materiaId}`)
    revalidatePath('/dashboard/teacher')
    return { success: 'La tarea se asignó a los estudiantes inscritos.' }
  } catch (error) {
    console.error('crearTarea: error inesperado', error)
    return { error: 'Ocurrió un error inesperado. Intentá nuevamente.' }
  }
}
