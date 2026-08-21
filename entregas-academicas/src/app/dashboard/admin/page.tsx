// Persona 3 — audit_logs completos, solo visibles para admin (RLS: audit_logs_select_admin).

import { requireRole } from '@/lib/auth'

const ACCION_STYLE: Record<string, string> = {
  INSERT: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-red-50 text-red-700',
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
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Audit logs</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Últimos {logs?.length ?? 0} eventos de <code>entregas</code> y <code>calificaciones</code>.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Tabla</th>
              <th className="px-4 py-3 font-medium">Acción</th>
              <th className="px-4 py-3 font-medium">Registro</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 text-zinc-600">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-900">
                  {perfiles?.find((p) => p.id === log.actor_id)?.nombre_completo ?? log.actor_id ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-600">{log.tabla}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      ACCION_STYLE[log.accion] ?? 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {log.accion}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{log.registro_id}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs?.length === 0 && (
          <p className="p-6 text-center text-sm text-zinc-500">No hay eventos registrados.</p>
        )}
      </div>
    </main>
  )
}
