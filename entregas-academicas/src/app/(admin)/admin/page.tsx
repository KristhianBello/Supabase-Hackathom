'use client'

// Persona 3 — dashboard de admin: `audit_logs` completos.
// TODO: listar audit_logs (acciones legítimas + intentos denegados si el
// trigger los registra) para el demo en vivo. RLS ya da acceso total a admin.

export default function AdminAuditLogsPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Audit logs</h1>
      <p className="mt-2 text-sm text-zinc-500">TODO(Persona 3): tabla de audit_logs.</p>
    </main>
  )
}
