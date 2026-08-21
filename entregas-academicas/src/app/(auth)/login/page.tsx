// Persona 2

import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form action={login} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>

        <input
          type="email"
          name="email"
          placeholder="Correo"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="w-full rounded border px-3 py-2"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded bg-black px-3 py-2 text-white"
        >
          Entrar
        </button>
      </form>
    </main>
  )
}
