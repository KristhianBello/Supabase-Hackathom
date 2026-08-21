import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { VoiceAction, VoiceCommandResult } from '@/lib/ai/voice'

export const runtime = 'nodejs'

const MAX_COMMAND_LENGTH = 1_000

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    action: {
      type: 'string',
      enum: ['seleccionar_tarea', 'rellenar_tarea', 'ninguna'],
    },
    tareaId: { type: ['string', 'null'] },
    materiaId: { type: ['string', 'null'] },
    titulo: { type: ['string', 'null'] },
    descripcion: { type: ['string', 'null'] },
    fechaLimite: { type: ['string', 'null'] },
  },
  required: ['reply', 'action', 'tareaId', 'materiaId', 'titulo', 'descripcion', 'fechaLimite'],
} as const

function text(value: unknown) {
  return typeof value === 'string' ? value : null
}

function parseResult(value: unknown): VoiceCommandResult | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Record<string, unknown>
  const action = candidate.action
  if (
    action !== 'seleccionar_tarea' &&
    action !== 'rellenar_tarea' &&
    action !== 'ninguna'
  ) {
    return null
  }

  const reply = text(candidate.reply)
  if (!reply) return null

  return {
    reply,
    action: action as VoiceAction,
    tareaId: text(candidate.tareaId),
    materiaId: text(candidate.materiaId),
    titulo: text(candidate.titulo),
    descripcion: text(candidate.descripcion),
    fechaLimite: text(candidate.fechaLimite),
  }
}

function outputText(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null
  const value = payload as Record<string, unknown>
  if (typeof value.output_text === 'string') return value.output_text

  const output = value.output
  if (!Array.isArray(output)) return null

  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const content = (item as { content?: unknown }).content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      if (part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string') {
        return (part as { text: string }).text
      }
    }
  }

  return null
}

function withoutAction(reply: string): VoiceCommandResult {
  return {
    reply,
    action: 'ninguna',
    tareaId: null,
    materiaId: null,
    titulo: null,
    descripcion: null,
    fechaLimite: null,
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    command?: unknown
    scopeMateriaId?: unknown
  } | null
  const command = text(body?.command)?.trim()
  const scopeMateriaId = text(body?.scopeMateriaId)

  if (!command || command.length > MAX_COMMAND_LENGTH) {
    return NextResponse.json({ error: 'El comando de voz es inválido o demasiado extenso.' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Falta configurar OPENAI_API_KEY en el servidor.' }, { status: 503 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Tu sesión venció.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.rol === 'estudiante') {
    const { data: tareas } = await supabase
      .from('tareas')
      .select('id, titulo, descripcion, fecha_limite, materias(nombre)')
      .gte('fecha_limite', new Date().toISOString())
      .order('fecha_limite')

    const permitidas = (tareas ?? []).map((tarea) => ({
      id: tarea.id,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fechaLimite: tarea.fecha_limite,
      materia: tarea.materias?.nombre ?? 'Materia',
    }))

    const result = await askAI({
      command,
      role: 'estudiante',
      context: permitidas,
    })

    if (!result) {
      return NextResponse.json({ error: 'El asistente no pudo interpretar el pedido.' }, { status: 502 })
    }

    if (result.action === 'seleccionar_tarea' && !permitidas.some((tarea) => tarea.id === result.tareaId)) {
      return NextResponse.json(withoutAction('No pude identificar una tarea disponible. Decime el nombre de la materia o tarea.'))
    }

    return NextResponse.json(result)
  }

  if (profile?.rol === 'profesor') {
    const { data: materias } = await supabase
      .from('materias')
      .select('id, nombre, descripcion')
      .eq('profesor_id', user.id)
      .order('nombre')

    const asignadas = (materias ?? []).filter(
      (materia) => !scopeMateriaId || materia.id === scopeMateriaId,
    )

    if (scopeMateriaId && asignadas.length === 0) {
      return NextResponse.json({ error: 'No tenés autorización para esa materia.' }, { status: 403 })
    }
    const result = await askAI({
      command,
      role: 'profesor',
      context: asignadas,
    })

    if (!result) {
      return NextResponse.json({ error: 'El asistente no pudo interpretar el pedido.' }, { status: 502 })
    }

    const materiaValida = asignadas.some((materia) => materia.id === result.materiaId)
    if (
      result.action === 'rellenar_tarea' &&
      (!materiaValida || !result.titulo || !result.fechaLimite)
    ) {
      return NextResponse.json(
        withoutAction('Necesito la materia, el título y una fecha límite para preparar la tarea.'),
      )
    }

    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'El asistente de voz solo está disponible para estudiantes y docentes.' }, { status: 403 })
}

async function askAI({
  command,
  role,
  context,
}: {
  command: string
  role: 'estudiante' | 'profesor'
  context: unknown
}) {
  const apiBase = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = process.env.AI_MODEL ?? 'gpt-5.6-terra'
  const reasoningEffort = process.env.AI_REASONING_EFFORT ?? 'low'

  const instructions =
    role === 'estudiante'
      ? 'Sos el asistente académico por voz de un estudiante. Elegí una tarea únicamente si coincide de forma clara con una de las tareas disponibles. Nunca inventes IDs ni afirmes que subiste un archivo: solo podés seleccionar una tarea para que el estudiante confirme la subida. Respondé en español ecuatoriano, de forma breve.'
      : 'Sos el asistente académico por voz de un docente. Podés preparar un borrador de tarea únicamente para una materia incluida en la lista. Nunca inventes IDs ni publiques la tarea: solo completás el formulario para que el docente la revise y confirme. Convertí fechas relativas a formato YYYY-MM-DDTHH:mm en hora de Ecuador continental; si no hay fecha clara, no propongas la acción. Respondé en español ecuatoriano, de forma breve.'

  const openAIResponse = await fetch(`${apiBase}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      reasoning: { effort: reasoningEffort },
      instructions,
      input: JSON.stringify({
        fechaActualEcuador: new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'America/Guayaquil',
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date()),
        comandoDelUsuario: command,
        datosAutorizados: context,
      }),
      text: {
        format: {
          type: 'json_schema',
          name: 'academic_voice_action',
          strict: true,
          schema: responseSchema,
        },
      },
    }),
  })

  if (!openAIResponse.ok) return null

  const payload = await openAIResponse.json()
  const resultText = outputText(payload)
  if (!resultText) return null

  try {
    return parseResult(JSON.parse(resultText))
  } catch {
    return null
  }
}
