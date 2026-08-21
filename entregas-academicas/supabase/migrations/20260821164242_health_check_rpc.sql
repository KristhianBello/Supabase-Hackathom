-- RPC publica y segura para comprobar la conexion de la aplicacion.
create or replace function public.health_check()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'status', 'ok',
    'checked_at', timezone('utc', now())
  )
$$;

revoke all on function public.health_check() from public;
grant execute on function public.health_check() to anon, authenticated;

comment on function public.health_check() is
  'Comprobacion publica sin datos sensibles para verificar la Data API.';
