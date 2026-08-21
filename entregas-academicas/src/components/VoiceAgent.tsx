'use client'

import { useEffect, useRef, useState } from 'react'
import type { VoiceCommandResult } from '@/lib/ai/voice'

type SpeechRecognitionEvent = Event & {
  results: {
    [index: number]: {
      [index: number]: { transcript: string }
    }
    length: number
  }
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  abort: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function recognitionConstructor(): SpeechRecognitionConstructor | null {
  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null
}

export function VoiceAgent({
  hint,
  onResult,
  scopeMateriaId,
}: {
  hint: string
  onResult: (result: VoiceCommandResult) => void
  scopeMateriaId?: string
}) {
  const recognition = useRef<SpeechRecognitionLike | null>(null)
  const [listening, setListening] = useState(false)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => recognition.current?.abort()
  }, [])

  async function interpret(command: string) {
    setWorking(true)
    setMessage(`Escuché: “${command}”`)

    try {
      const response = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, scopeMateriaId }),
      })
      const payload = (await response.json()) as VoiceCommandResult & { error?: string }

      if (!response.ok || payload.error) {
        setMessage(payload.error ?? 'No se pudo consultar al asistente de voz.')
        return
      }

      onResult(payload)
      setMessage(payload.reply)

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const speech = new SpeechSynthesisUtterance(payload.reply)
        speech.lang = 'es-EC'
        window.speechSynthesis.speak(speech)
      }
    } catch {
      setMessage('No se pudo conectar con el asistente de voz.')
    } finally {
      setWorking(false)
    }
  }

  function start() {
    const Constructor = recognitionConstructor()
    if (!Constructor) {
      setMessage('Tu navegador no permite reconocimiento de voz. Probá con Chrome o Edge.')
      return
    }

    const instance = new Constructor()
    recognition.current = instance
    instance.lang = 'es-EC'
    instance.continuous = false
    instance.interimResults = false
    instance.onstart = () => setListening(true)
    instance.onend = () => setListening(false)
    instance.onerror = (event) => {
      setListening(false)
      setMessage(
        event.error === 'not-allowed'
          ? 'Permití el uso del micrófono para hablar con el asistente.'
          : 'No pude escuchar el comando. Intentá nuevamente.',
      )
    }
    instance.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1]
      const command = lastResult?.[0]?.transcript.trim()
      if (command) void interpret(command)
    }

    try {
      instance.start()
    } catch {
      setMessage('El micrófono ya está activo. Terminá la grabación e intentá nuevamente.')
    }
  }

  return (
    <div className="rounded-md border border-pacifico/30 bg-pacifico-soft/50 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={start}
          disabled={listening || working}
          className="rounded-md border border-pacifico/40 bg-paper-raised px-3 py-1.5 text-sm font-medium text-pacifico-dark transition-colors hover:bg-pacifico-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {listening ? 'Escuchando…' : working ? 'Pensando…' : 'Hablar con asistente'}
        </button>
        <p className="text-xs text-ink-muted">{hint}</p>
      </div>
      {message && <p className="mt-2 text-sm text-ink">{message}</p>}
    </div>
  )
}
