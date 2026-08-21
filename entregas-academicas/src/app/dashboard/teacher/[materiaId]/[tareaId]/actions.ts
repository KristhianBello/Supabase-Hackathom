'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function calificar(formData: FormData) {
  const entregaId = formData.get('entrega_id') as string
  const materiaId = formData.get('materia_id') as string
  const tareaId = formData.get('tarea_id') as string
  const nota = Number(formData.get('nota'))
  const comentario = (formData.get('comentario') as string) || null

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  // RLS (calificaciones_insert/update_profesor_or_admin) solo deja pasar
  // esto si el usuario es el profesor de la tarea; si no, no afecta filas.
  await supabase
    .from('calificaciones')
    .upsert(
      { entrega_id: entregaId, nota, comentario, calificado_por: user.id },
      { onConflict: 'entrega_id' },
    )

  revalidatePath(`/dashboard/teacher/${materiaId}/${tareaId}`)
}
