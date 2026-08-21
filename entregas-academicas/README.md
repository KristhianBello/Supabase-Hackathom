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

## Preparar usuarios

Crea los usuarios desde Supabase Auth. Cada usuario nuevo empieza como
`estudiante`. Para preparar el primer administrador o un profesor, cambia su
rol desde el SQL Editor o una operación administrativa confiable:

```sql
update public.profiles
set rol = 'admin'
where id = '<uuid-del-usuario>';
```

Nunca expongas una clave secreta o `service_role` en variables
`NEXT_PUBLIC_*`.
