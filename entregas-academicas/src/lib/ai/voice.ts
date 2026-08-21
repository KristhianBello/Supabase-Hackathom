export type VoiceAction = 'seleccionar_tarea' | 'rellenar_tarea' | 'ninguna'

export type VoiceCommandResult = {
  reply: string
  action: VoiceAction
  tareaId: string | null
  materiaId: string | null
  titulo: string | null
  descripcion: string | null
  fechaLimite: string | null
}
