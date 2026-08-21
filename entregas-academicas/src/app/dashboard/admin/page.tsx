// Persona 3 — audit_logs completos, solo visibles para admin (RLS: audit_logs_select_admin).

import { requireRole } from '@/lib/auth'

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
    <main className="p-8">
      <h1 className="text-xl font-semibold">Audit logs</h1>

      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Fecha</th>
              <th className="py-2 pr-4">Actor</th>
              <th className="py-2 pr-4">Tabla</th>
              <th className="py-2 pr-4">Acción</th>
              <th className="py-2 pr-4">Registro</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="py-2 pr-4">{new Date(log.created_at).toLocaleString()}</td>
                <td className="py-2 pr-4">
                  {perfiles?.find((p) => p.id === log.actor_id)?.nombre_completo ?? log.actor_id ?? '—'}
                </td>
                <td className="py-2 pr-4">{log.tabla}</td>
                <td className="py-2 pr-4">{log.accion}</td>
                <td className="py-2 pr-4 font-mono text-xs">{log.registro_id}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs?.length === 0 && <p className="mt-2 text-sm text-zinc-500">No hay eventos registrados.</p>}
      </div>
    </main>
  )
}
