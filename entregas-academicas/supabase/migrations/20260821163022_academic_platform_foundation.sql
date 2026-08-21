-- Migracion reproducible de la plataforma de entregas academicas seguras.
-- La autorizacion real vive en Postgres (RLS) y Storage, no en el frontend.

create schema if not exists private;

create type public.app_role as enum ('admin', 'profesor', 'estudiante');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_completo text not null default '',
  rol public.app_role not null default 'estudiante',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.materias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 160),
  descripcion text,
  profesor_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nombre, profesor_id)
);

create table public.inscripciones (
  materia_id uuid not null references public.materias (id) on delete cascade,
  estudiante_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (materia_id, estudiante_id)
);

create table public.tareas (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid not null references public.materias (id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) between 1 and 200),
  descripcion text,
  fecha_limite timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entregas (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references public.tareas (id) on delete cascade,
  estudiante_id uuid not null references public.profiles (id) on delete cascade,
  archivo_path text not null check (char_length(archivo_path) between 1 and 1024),
  archivo_nombre text not null check (char_length(btrim(archivo_nombre)) between 1 and 255),
  entregada_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tarea_id, estudiante_id),
  unique (archivo_path)
);

create table public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  entrega_id uuid not null unique references public.entregas (id) on delete cascade,
  nota numeric(5, 2) not null check (nota between 0 and 100),
  comentario text,
  calificado_por uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  tabla text not null,
  registro_id uuid,
  accion text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid references auth.users (id) on delete set null,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  created_at timestamptz not null default now()
);

create index materias_profesor_id_idx on public.materias (profesor_id);
create index inscripciones_estudiante_id_idx on public.inscripciones (estudiante_id);
create index tareas_materia_fecha_idx on public.tareas (materia_id, fecha_limite);
create index entregas_estudiante_id_idx on public.entregas (estudiante_id);
create index entregas_tarea_id_idx on public.entregas (tarea_id);
create index calificaciones_calificado_por_idx on public.calificaciones (calificado_por);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_registro_idx on public.audit_logs (tabla, registro_id);

create or replace function private.safe_uuid(value text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return value::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function private.rol_actual()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.rol
  from public.profiles as p
  where p.id = (select auth.uid())
$$;

create or replace function private.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.rol_actual() = 'admin'::public.app_role
$$;

create or replace function private.es_profesor_materia(target_materia_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.materias as m
      where m.id = target_materia_id
        and m.profesor_id = (select auth.uid())
    )
$$;

create or replace function private.es_estudiante_inscrito(target_materia_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.inscripciones as i
      where i.materia_id = target_materia_id
        and i.estudiante_id = (select auth.uid())
    )
$$;

create or replace function private.puede_acceder_materia(target_materia_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      private.es_admin()
      or private.es_profesor_materia(target_materia_id)
      or private.es_estudiante_inscrito(target_materia_id)
    )
$$;

create or replace function private.es_profesor_tarea(target_tarea_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.tareas as t
      join public.materias as m on m.id = t.materia_id
      where t.id = target_tarea_id
        and m.profesor_id = (select auth.uid())
    )
$$;

create or replace function private.puede_acceder_tarea(target_tarea_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.tareas as t
      where t.id = target_tarea_id
        and private.puede_acceder_materia(t.materia_id)
    )
$$;

create or replace function private.puede_entregar_tarea(target_tarea_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.rol_actual() = 'estudiante'::public.app_role
    and exists (
      select 1
      from public.tareas as t
      join public.inscripciones as i on i.materia_id = t.materia_id
      where t.id = target_tarea_id
        and i.estudiante_id = (select auth.uid())
        and t.fecha_limite >= now()
    )
$$;

create or replace function private.entrega_sin_calificar(target_entrega_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and not exists (
      select 1
      from public.calificaciones as c
      where c.entrega_id = target_entrega_id
    )
$$;

create or replace function private.puede_calificar_entrega(target_entrega_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      private.es_admin()
      or exists (
        select 1
        from public.entregas as e
        join public.tareas as t on t.id = e.tarea_id
        join public.materias as m on m.id = t.materia_id
        where e.id = target_entrega_id
          and m.profesor_id = (select auth.uid())
      )
    )
$$;

create or replace function private.puede_ver_perfil(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      target_profile_id = (select auth.uid())
      or private.es_admin()
      or exists (
        select 1
        from public.materias as m
        join public.inscripciones as i on i.materia_id = m.id
        where m.profesor_id = (select auth.uid())
          and i.estudiante_id = target_profile_id
      )
      or exists (
        select 1
        from public.inscripciones as i
        join public.materias as m on m.id = i.materia_id
        where i.estudiante_id = (select auth.uid())
          and m.profesor_id = target_profile_id
      )
    )
$$;

create or replace function private.ruta_entrega_valida(
  target_path text,
  target_tarea_id uuid,
  target_estudiante_id uuid
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select split_part(target_path, '/', 1) = target_tarea_id::text
    and split_part(target_path, '/', 2) = target_estudiante_id::text
    and split_part(target_path, '/', 3) <> ''
    and split_part(target_path, '/', 4) = ''
    and lower(target_path) like '%.pdf'
$$;

create or replace function private.puede_modificar_archivo(
  target_tarea_id uuid,
  target_estudiante_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and target_estudiante_id = (select auth.uid())
    and private.puede_entregar_tarea(target_tarea_id)
    and not exists (
      select 1
      from public.entregas as e
      join public.calificaciones as c on c.entrega_id = e.id
      where e.tarea_id = target_tarea_id
        and e.estudiante_id = target_estudiante_id
    )
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.proteger_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'No se puede cambiar el id del perfil' using errcode = '42501';
  end if;

  if new.rol is distinct from old.rol
    and (select auth.uid()) is not null
    and not private.es_admin()
  then
    raise exception 'Solo un administrador puede cambiar roles' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function private.validar_materia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles as p
    where p.id = new.profesor_id and p.rol = 'profesor'::public.app_role
  ) then
    raise exception 'profesor_id debe pertenecer a un profesor' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.validar_inscripcion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles as p
    where p.id = new.estudiante_id and p.rol = 'estudiante'::public.app_role
  ) then
    raise exception 'estudiante_id debe pertenecer a un estudiante' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.validar_calificacion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles as p
    where p.id = new.calificado_por
      and p.rol in ('profesor'::public.app_role, 'admin'::public.app_role)
  ) then
    raise exception 'calificado_por debe ser profesor o administrador' using errcode = '23514';
  end if;

  if (select auth.uid()) is not null
    and not private.es_admin()
    and new.calificado_por <> (select auth.uid())
  then
    raise exception 'Un profesor solo puede calificar con su propia identidad' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function private.proteger_identidad_entrega()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    new.tarea_id is distinct from old.tarea_id
    or new.estudiante_id is distinct from old.estudiante_id
  ) and (select auth.uid()) is not null and not private.es_admin()
  then
    raise exception 'No se puede reasignar una entrega' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.app_role;
begin
  requested_role := case
    when new.raw_app_meta_data ->> 'rol' in ('admin', 'profesor', 'estudiante')
      then (new.raw_app_meta_data ->> 'rol')::public.app_role
    else 'estudiante'::public.app_role
  end;

  insert into public.profiles (id, nombre_completo, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''),
    requested_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function private.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_payload jsonb;
  new_payload jsonb;
  target_id uuid;
begin
  if tg_op <> 'INSERT' then
    old_payload := to_jsonb(old);
  end if;
  if tg_op <> 'DELETE' then
    new_payload := to_jsonb(new);
  end if;

  target_id := private.safe_uuid(coalesce(
    new_payload ->> 'id',
    old_payload ->> 'id',
    new_payload ->> 'materia_id',
    old_payload ->> 'materia_id'
  ));

  insert into public.audit_logs (
    tabla,
    registro_id,
    accion,
    actor_id,
    datos_anteriores,
    datos_nuevos
  ) values (
    tg_table_schema || '.' || tg_table_name,
    target_id,
    tg_op,
    (select auth.uid()),
    old_payload,
    new_payload
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger profiles_protect_role
before update on public.profiles
for each row execute function private.proteger_perfil();

create trigger materias_set_updated_at
before update on public.materias
for each row execute function private.set_updated_at();

create trigger materias_validate_profesor
before insert or update of profesor_id on public.materias
for each row execute function private.validar_materia();

create trigger inscripciones_validate_estudiante
before insert or update of estudiante_id on public.inscripciones
for each row execute function private.validar_inscripcion();

create trigger tareas_set_updated_at
before update on public.tareas
for each row execute function private.set_updated_at();

create trigger entregas_set_updated_at
before update on public.entregas
for each row execute function private.set_updated_at();

create trigger entregas_protect_identity
before update on public.entregas
for each row execute function private.proteger_identidad_entrega();

create trigger calificaciones_set_updated_at
before update on public.calificaciones
for each row execute function private.set_updated_at();

create trigger calificaciones_validate_actor
before insert or update of calificado_por on public.calificaciones
for each row execute function private.validar_calificacion();

create trigger profiles_audit
after insert or update or delete on public.profiles
for each row execute function private.registrar_auditoria();

create trigger materias_audit
after insert or update or delete on public.materias
for each row execute function private.registrar_auditoria();

create trigger inscripciones_audit
after insert or update or delete on public.inscripciones
for each row execute function private.registrar_auditoria();

create trigger tareas_audit
after insert or update or delete on public.tareas
for each row execute function private.registrar_auditoria();

create trigger entregas_audit
after insert or update or delete on public.entregas
for each row execute function private.registrar_auditoria();

create trigger calificaciones_audit
after insert or update or delete on public.calificaciones
for each row execute function private.registrar_auditoria();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.materias enable row level security;
alter table public.inscripciones enable row level security;
alter table public.tareas enable row level security;
alter table public.entregas enable row level security;
alter table public.calificaciones enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_related
on public.profiles for select
to authenticated
using (private.puede_ver_perfil(id));

create policy profiles_update_self_or_admin
on public.profiles for update
to authenticated
using (id = (select auth.uid()) or private.es_admin())
with check (id = (select auth.uid()) or private.es_admin());

create policy materias_select_authorized
on public.materias for select
to authenticated
using (private.puede_acceder_materia(id));

create policy materias_insert_admin
on public.materias for insert
to authenticated
with check (private.es_admin());

create policy materias_update_admin
on public.materias for update
to authenticated
using (private.es_admin())
with check (private.es_admin());

create policy materias_delete_admin
on public.materias for delete
to authenticated
using (private.es_admin());

create policy inscripciones_select_authorized
on public.inscripciones for select
to authenticated
using (
  private.es_admin()
  or estudiante_id = (select auth.uid())
  or private.es_profesor_materia(materia_id)
);

create policy inscripciones_insert_admin
on public.inscripciones for insert
to authenticated
with check (private.es_admin());

create policy inscripciones_delete_admin
on public.inscripciones for delete
to authenticated
using (private.es_admin());

create policy tareas_select_authorized
on public.tareas for select
to authenticated
using (private.puede_acceder_materia(materia_id));

create policy tareas_insert_profesor_or_admin
on public.tareas for insert
to authenticated
with check (private.es_admin() or private.es_profesor_materia(materia_id));

create policy tareas_update_profesor_or_admin
on public.tareas for update
to authenticated
using (private.es_admin() or private.es_profesor_materia(materia_id))
with check (private.es_admin() or private.es_profesor_materia(materia_id));

create policy tareas_delete_profesor_or_admin
on public.tareas for delete
to authenticated
using (private.es_admin() or private.es_profesor_materia(materia_id));

create policy entregas_select_authorized
on public.entregas for select
to authenticated
using (
  private.es_admin()
  or estudiante_id = (select auth.uid())
  or private.es_profesor_tarea(tarea_id)
);

create policy entregas_insert_student_or_admin
on public.entregas for insert
to authenticated
with check (
  private.ruta_entrega_valida(archivo_path, tarea_id, estudiante_id)
  and (
    private.es_admin()
    or (
      estudiante_id = (select auth.uid())
      and private.puede_entregar_tarea(tarea_id)
    )
  )
);

create policy entregas_update_student_or_admin
on public.entregas for update
to authenticated
using (
  private.es_admin()
  or (
    estudiante_id = (select auth.uid())
    and private.puede_entregar_tarea(tarea_id)
    and private.entrega_sin_calificar(id)
  )
)
with check (
  private.ruta_entrega_valida(archivo_path, tarea_id, estudiante_id)
  and (
    private.es_admin()
    or (
      estudiante_id = (select auth.uid())
      and private.puede_entregar_tarea(tarea_id)
      and private.entrega_sin_calificar(id)
    )
  )
);

create policy entregas_delete_admin
on public.entregas for delete
to authenticated
using (private.es_admin());

create policy calificaciones_select_authorized
on public.calificaciones for select
to authenticated
using (
  private.es_admin()
  or private.puede_calificar_entrega(entrega_id)
  or exists (
    select 1
    from public.entregas as e
    where e.id = entrega_id
      and e.estudiante_id = (select auth.uid())
  )
);

create policy calificaciones_insert_profesor_or_admin
on public.calificaciones for insert
to authenticated
with check (
  private.puede_calificar_entrega(entrega_id)
  and (private.es_admin() or calificado_por = (select auth.uid()))
);

create policy calificaciones_update_profesor_or_admin
on public.calificaciones for update
to authenticated
using (private.puede_calificar_entrega(entrega_id))
with check (
  private.puede_calificar_entrega(entrega_id)
  and (private.es_admin() or calificado_por = (select auth.uid()))
);

create policy calificaciones_delete_admin
on public.calificaciones for delete
to authenticated
using (private.es_admin());

create policy audit_logs_select_admin
on public.audit_logs for select
to authenticated
using (private.es_admin());

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.safe_uuid(text) to authenticated;
grant execute on function private.rol_actual() to authenticated;
grant execute on function private.es_admin() to authenticated;
grant execute on function private.es_profesor_materia(uuid) to authenticated;
grant execute on function private.es_estudiante_inscrito(uuid) to authenticated;
grant execute on function private.puede_acceder_materia(uuid) to authenticated;
grant execute on function private.es_profesor_tarea(uuid) to authenticated;
grant execute on function private.puede_acceder_tarea(uuid) to authenticated;
grant execute on function private.puede_entregar_tarea(uuid) to authenticated;
grant execute on function private.entrega_sin_calificar(uuid) to authenticated;
grant execute on function private.puede_calificar_entrega(uuid) to authenticated;
grant execute on function private.puede_ver_perfil(uuid) to authenticated;
grant execute on function private.ruta_entrega_valida(text, uuid, uuid) to authenticated;
grant execute on function private.puede_modificar_archivo(uuid, uuid) to authenticated;

revoke all on all tables in schema public from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.materias to authenticated;
grant select, insert, delete on public.inscripciones to authenticated;
grant select, insert, update, delete on public.tareas to authenticated;
grant select, insert, update, delete on public.entregas to authenticated;
grant select, insert, update, delete on public.calificaciones to authenticated;
grant select on public.audit_logs to authenticated;
grant usage on type public.app_role to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entregas-alumnos',
  'entregas-alumnos',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy storage_select_authorized
on storage.objects for select
to authenticated
using (
  bucket_id = 'entregas-alumnos'
  and (
    private.es_admin()
    or (
      private.safe_uuid((storage.foldername(name))[2]) = (select auth.uid())
      and private.puede_acceder_tarea(
        private.safe_uuid((storage.foldername(name))[1])
      )
    )
    or private.es_profesor_tarea(
      private.safe_uuid((storage.foldername(name))[1])
    )
  )
);

create policy storage_insert_student_or_admin
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'entregas-alumnos'
  and array_length(storage.foldername(name), 1) = 2
  and private.safe_uuid((storage.foldername(name))[1]) is not null
  and private.safe_uuid((storage.foldername(name))[2]) is not null
  and lower(name) like '%.pdf'
  and (
    private.es_admin()
    or private.puede_modificar_archivo(
      private.safe_uuid((storage.foldername(name))[1]),
      private.safe_uuid((storage.foldername(name))[2])
    )
  )
);

create policy storage_update_student_or_admin
on storage.objects for update
to authenticated
using (
  bucket_id = 'entregas-alumnos'
  and (
    private.es_admin()
    or private.puede_modificar_archivo(
      private.safe_uuid((storage.foldername(name))[1]),
      private.safe_uuid((storage.foldername(name))[2])
    )
  )
)
with check (
  bucket_id = 'entregas-alumnos'
  and array_length(storage.foldername(name), 1) = 2
  and lower(name) like '%.pdf'
  and (
    private.es_admin()
    or private.puede_modificar_archivo(
      private.safe_uuid((storage.foldername(name))[1]),
      private.safe_uuid((storage.foldername(name))[2])
    )
  )
);

create policy storage_delete_admin
on storage.objects for delete
to authenticated
using (bucket_id = 'entregas-alumnos' and private.es_admin());

comment on schema private is 'Funciones internas no expuestas por la Data API.';
comment on table public.audit_logs is
  'Audita mutaciones aceptadas. Intentos rechazados por RLS deben observarse en logs de Postgres/API.';
comment on column public.entregas.archivo_path is
  'Ruta obligatoria: {tarea_id}/{estudiante_id}/{archivo.pdf}.';
