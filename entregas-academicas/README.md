# Entregas Académicas

Plataforma Next.js + Supabase para entregar, revisar y calificar tareas con
autorización Zero Trust mediante Row Level Security (RLS).

## Desarrollo local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.local.example` a `.env.local` y agrega la URL y la clave
   publicable del proyecto Supabase.

3. Inicia la aplicación:

   ```bash
   npm run dev
   ```

## Supabase

El esquema reproducible está en `supabase/migrations/`. Incluye:

- Perfiles con roles `admin`, `profesor` y `estudiante`.
- Materias, inscripciones, tareas, entregas y calificaciones.
- RLS para aislar cursos, entregas, notas y auditoría.
- Bucket privado `entregas-alumnos` para archivos PDF de hasta 10 MB.
- Rutas de Storage con formato
  `{tarea_id}/{estudiante_id}/{archivo.pdf}`.
- Auditoría de mutaciones aceptadas en `audit_logs`.

Los tipos de TypeScript en `src/lib/database.types.ts` se generan desde el
esquema remoto.

## Verificar la conexión

Con `.env.local` configurado, ejecuta:

```bash
npm run check:supabase
```

La aplicación también expone `GET /api/health`. Una conexión correcta devuelve
HTTP `200` con `status: "ok"`; el endpoint no expone claves ni datos académicos.

## Usuarios de demostración

Los ocho perfiles ficticios se definen en `scripts/demo-users.mjs`. Para
crearlos o actualizarlos con Supabase Auth, configura `SUPABASE_SECRET_KEY` y
`DEMO_USER_PASSWORD` únicamente en `.env.local` y ejecuta:

```bash
npm run seed:demo-users
```

Después de aplicar `supabase/seed.sql`, comprueba todos los accesos y sus roles:

```bash
npm run seed:demo-files
npm run check:demo-logins
```

El primer comando crea los PDF ficticios referenciados por las entregas en el
bucket privado. Se autentica como el administrador de demostración y no
requiere una clave secreta.

Estos usuarios y datos son solo para desarrollo o demostraciones. Nunca
expongas una clave secreta o `service_role` en variables `NEXT_PUBLIC_*`, ni
uses estas credenciales en producción.
