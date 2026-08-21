// Persona 3 — audit_logs completos, solo visibles para admin (RLS: audit_logs_select_admin).

import { requireRole } from '@/lib/auth'
import { Stamp } from '@/components/Stamp'

const ACCION_TONE: Record<string, 'musgo' | 'toquilla' | 'brick'> = {
  INSERT: 'musgo',
  UPDATE: 'toquilla',
  DELETE: 'brick',
}

export default async function AdminAuditLogsPage() {
  const { supabase } = await requireRole('admin')

  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, created_at, actor_id, tabla, accion, registro_id')
    .order('created_at', { ascending: false })
    .limit(200)

  const actorIds = [...new Set((logs ?? []).map((l) => l.actor_id).filter((id): id is string => !!id))]

  const { data: perfiles } = actorIds.length
    ? await supabase.from('profiles').select('id, nombre_completo').in('id', actorIds)
    : { data: [] as { id: string; nombre_completo: string }[] }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
        Libro de auditoría
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Audit logs</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Últimos {logs?.length ?? 0} eventos de <code className="font-mono">entregas</code> y{' '}
        <code className="font-mono">calificaciones</code>.
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
          {error.message}
        </p>
      )}

      <div className="paper-shadow mt-8 overflow-x-auto rounded-lg border border-arena bg-paper-raised">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-arena text-ink-muted">
              <th className="px-4 py-3 font-mono text-xs font-semibold tracking-wide uppercase">Fecha</th>
              <th className="px-4 py-3 font-mono text-xs font-semibold tracking-wide uppercase">Actor</th>
              <th className="px-4 py-3 font-mono text-xs font-semibold tracking-wide uppercase">Tabla</th>
              <th className="px-4 py-3 font-mono text-xs font-semibold tracking-wide uppercase">Acción</th>
              <th className="px-4 py-3 font-mono text-xs font-semibold tracking-wide uppercase">Registro</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-arena-soft odd:bg-arena-soft/40 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-ink">
                  {perfiles?.find((p) => p.id === log.actor_id)?.nombre_completo ?? log.actor_id ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">{log.tabla}</td>
                <td className="px-4 py-3">
                  <Stamp tone={ACCION_TONE[log.accion] ?? 'ink'}>{log.accion}</Stamp>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">{log.registro_id}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs?.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-muted">No hay eventos registrados.</p>
        )}
      </div>
    </main>
  )
}
