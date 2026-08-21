// Insignia con forma de sello de registro: la usamos para todo lo que
// representa un estado verificado (rol, calificación, tipo de evento de
// auditoría) — el mismo lenguaje visual que un timbre en un libro oficial.

type StampTone = 'cacao' | 'toquilla' | 'pacifico' | 'musgo' | 'brick' | 'ink'

const TONE_STYLES: Record<StampTone, string> = {
  cacao: 'border-cacao text-cacao bg-cacao/[0.06]',
  toquilla: 'border-toquilla text-cacao-dark bg-toquilla-soft',
  pacifico: 'border-pacifico text-pacifico bg-pacifico-soft',
  musgo: 'border-musgo text-musgo bg-musgo-soft',
  brick: 'border-brick text-brick bg-brick-soft',
  ink: 'border-ink-muted text-ink-muted bg-arena-soft',
}

export function Stamp({
  tone = 'ink',
  children,
  className = '',
}: {
  tone?: StampTone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-block -rotate-2 rounded-[3px] border-[1.5px] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.08em] uppercase ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
