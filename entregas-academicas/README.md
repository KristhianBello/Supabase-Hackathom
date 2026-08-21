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

## Operación con datos reales

Los datos de `supabase/seed.sql` son únicamente de demostración. En una
instalación real, el administrador asigna cada materia a un perfil con rol
`profesor` e inscribe a los estudiantes correspondientes. Después, el profesor
entra en esa materia y usa **Nueva tarea para esta materia**: la tarea se guarda
en Supabase y solo aparece para los estudiantes inscritos, sin depender de
datos ficticios.

Para habilitar las funciones de IA, agrega en tu `.env.local` las variables
`OPENAI_API_KEY`, `AI_MODEL=gpt-5.6-terra` y `AI_REASONING_EFFORT=low`. Estas
variables son solo de servidor; nunca deben llevar el prefijo `NEXT_PUBLIC_`.

El asistente de voz escucha desde el navegador, envía únicamente la
transcripción al servidor y responde con una propuesta: en estudiantes elige
una tarea disponible para la subida; en docentes completa el borrador de una
tarea. La acción final siempre la confirma el usuario con el botón de subir o
asignar.
