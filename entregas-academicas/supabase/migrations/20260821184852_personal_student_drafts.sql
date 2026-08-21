-- Borradores privados: archivos que el estudiante ya preparó, pero todavía no
-- ha asociado a una tarea. La ruta obligatoria es {estudiante_id}/{archivo.pdf}.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'borradores-alumnos',
  'borradores-alumnos',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy storage_drafts_select_own
on storage.objects for select
to authenticated
using (
  bucket_id = 'borradores-alumnos'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy storage_drafts_insert_own
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'borradores-alumnos'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(name) like '%.pdf'
);

create policy storage_drafts_update_own
on storage.objects for update
to authenticated
using (
  bucket_id = 'borradores-alumnos'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'borradores-alumnos'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(name) like '%.pdf'
);

create policy storage_drafts_delete_own
on storage.objects for delete
to authenticated
using (
  bucket_id = 'borradores-alumnos'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
