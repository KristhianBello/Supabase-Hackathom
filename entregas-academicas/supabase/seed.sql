-- Datos ficticios para desarrollo y demostraciones.
-- En un proyecto remoto, crea primero los usuarios con `npm run seed:demo-users`
-- para que tengan contraseña e identidad de acceso. Estos inserts permiten que
-- `supabase db reset` reconstruya localmente las relaciones académicas.

begin;

insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'maria.zambrano@demo.manabi.edu.ec',
    '{"nombre_completo":"María Auxiliadora Zambrano"}'::jsonb,
    '{"rol":"admin","provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'jose.cedeno@demo.manabi.edu.ec',
    '{"nombre_completo":"José Luis Cedeño"}'::jsonb,
    '{"rol":"profesor","provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'ana.vera@demo.manabi.edu.ec',
    '{"nombre_completo":"Ana Lucía Vera"}'::jsonb,
    '{"rol":"profesor","provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'carlos.mendoza@demo.manabi.edu.ec',
    '{"nombre_completo":"Carlos Alberto Mendoza"}'::jsonb,
    '{"rol":"estudiante","provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'maria.loor@demo.manabi.edu.ec',
    '{"nombre_completo":"María José Loor"}'::jsonb,
    '{"rol":"estudiante","provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'luis.moreira@demo.manabi.edu.ec',
    '{"nombre_completo":"Luis Fernando Moreira"}'::jsonb,
    '{"rol":"estudiante","provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    'andrea.mera@demo.manabi.edu.ec',
    '{"nombre_completo":"Andrea Carolina Mera"}'::jsonb,
    '{"rol":"estudiante","provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    'juan.alcivar@demo.manabi.edu.ec',
    '{"nombre_completo":"Juan Pablo Alcívar"}'::jsonb,
    '{"rol":"estudiante","provider":"email","providers":["email"]}'::jsonb
  )
on conflict (id) do update
set email = excluded.email,
    raw_user_meta_data = excluded.raw_user_meta_data,
    raw_app_meta_data = excluded.raw_app_meta_data;

insert into public.profiles (id, nombre_completo, rol)
values
  ('10000000-0000-4000-8000-000000000001', 'María Auxiliadora Zambrano', 'admin'),
  ('10000000-0000-4000-8000-000000000002', 'José Luis Cedeño', 'profesor'),
  ('10000000-0000-4000-8000-000000000003', 'Ana Lucía Vera', 'profesor'),
  ('10000000-0000-4000-8000-000000000004', 'Carlos Alberto Mendoza', 'estudiante'),
  ('10000000-0000-4000-8000-000000000005', 'María José Loor', 'estudiante'),
  ('10000000-0000-4000-8000-000000000006', 'Luis Fernando Moreira', 'estudiante'),
  ('10000000-0000-4000-8000-000000000007', 'Andrea Carolina Mera', 'estudiante'),
  ('10000000-0000-4000-8000-000000000008', 'Juan Pablo Alcívar', 'estudiante')
on conflict (id) do update
set nombre_completo = excluded.nombre_completo,
    rol = excluded.rol;

insert into public.materias (id, nombre, descripcion, profesor_id)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'Matemática Aplicada',
    'Resolución de problemas numéricos vinculados con actividades productivas de Manabí.',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Programación Web',
    'Construcción de aplicaciones web seguras con Next.js y Supabase.',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Comunicación Académica',
    'Producción escrita y oral con énfasis en identidad y cultura manabita.',
    '10000000-0000-4000-8000-000000000003'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'Emprendimiento y Cultura Manabita',
    'Diseño de propuestas sostenibles basadas en productos y saberes locales.',
    '10000000-0000-4000-8000-000000000003'
  )
on conflict (id) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    profesor_id = excluded.profesor_id;

insert into public.inscripciones (materia_id, estudiante_id)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000006'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000006'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000007'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000008'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000007'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000008'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000007'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000008')
on conflict (materia_id, estudiante_id) do nothing;

insert into public.tareas (id, materia_id, titulo, descripcion, fecha_limite)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Modelación de costos de producción',
    'Resolver un caso de producción artesanal usando funciones y porcentajes.',
    '2026-08-18 23:59:00-05'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'Estadística de ventas locales',
    'Analizar una muestra de ventas y presentar media, mediana y dispersión.',
    '2026-09-04 23:59:00-05'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000002',
    'Formulario de entregas con Supabase',
    'Implementar validación, carga de PDF y registro de la entrega.',
    '2026-08-20 23:59:00-05'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000002',
    'Panel académico responsivo',
    'Diseñar un panel accesible para tareas pendientes y calificaciones.',
    '2026-09-10 23:59:00-05'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000003',
    'Ensayo sobre identidad manabita',
    'Redactar un ensayo argumentativo con fuentes y referencias bibliográficas.',
    '2026-08-19 23:59:00-05'
  ),
  (
    '30000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000003',
    'Exposición sobre tradiciones de Manabí',
    'Preparar una exposición breve sobre una tradición de la provincia.',
    '2026-09-06 23:59:00-05'
  ),
  (
    '30000000-0000-4000-8000-000000000007',
    '20000000-0000-4000-8000-000000000004',
    'Modelo de negocio para un producto local',
    'Proponer clientes, costos, canales y valor diferencial del producto.',
    '2026-09-12 23:59:00-05'
  )
on conflict (id) do update
set materia_id = excluded.materia_id,
    titulo = excluded.titulo,
    descripcion = excluded.descripcion,
    fecha_limite = excluded.fecha_limite;

insert into public.entregas (
  id,
  tarea_id,
  estudiante_id,
  archivo_path,
  archivo_nombre,
  entregada_at
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000004',
    '30000000-0000-4000-8000-000000000001/10000000-0000-4000-8000-000000000004/modelacion-costos-carlos.pdf',
    'modelacion-costos-carlos.pdf',
    '2026-08-17 18:20:00-05'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000001/10000000-0000-4000-8000-000000000005/modelacion-costos-maria.pdf',
    'modelacion-costos-maria.pdf',
    '2026-08-18 20:05:00-05'
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000006',
    '30000000-0000-4000-8000-000000000001/10000000-0000-4000-8000-000000000006/modelacion-costos-luis.pdf',
    'modelacion-costos-luis.pdf',
    '2026-08-19 00:15:00-05'
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004',
    '30000000-0000-4000-8000-000000000003/10000000-0000-4000-8000-000000000004/formulario-supabase-carlos.pdf',
    'formulario-supabase-carlos.pdf',
    '2026-08-19 19:10:00-05'
  ),
  (
    '40000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000006',
    '30000000-0000-4000-8000-000000000003/10000000-0000-4000-8000-000000000006/formulario-supabase-luis.pdf',
    'formulario-supabase-luis.pdf',
    '2026-08-20 22:40:00-05'
  ),
  (
    '40000000-0000-4000-8000-000000000006',
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000008',
    '30000000-0000-4000-8000-000000000003/10000000-0000-4000-8000-000000000008/formulario-supabase-juan.pdf',
    'formulario-supabase-juan.pdf',
    '2026-08-21 08:10:00-05'
  ),
  (
    '40000000-0000-4000-8000-000000000007',
    '30000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000005/10000000-0000-4000-8000-000000000005/ensayo-identidad-maria.pdf',
    'ensayo-identidad-maria.pdf',
    '2026-08-18 17:30:00-05'
  ),
  (
    '40000000-0000-4000-8000-000000000008',
    '30000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000007',
    '30000000-0000-4000-8000-000000000005/10000000-0000-4000-8000-000000000007/ensayo-identidad-andrea.pdf',
    'ensayo-identidad-andrea.pdf',
    '2026-08-19 22:05:00-05'
  )
on conflict (id) do update
set tarea_id = excluded.tarea_id,
    estudiante_id = excluded.estudiante_id,
    archivo_path = excluded.archivo_path,
    archivo_nombre = excluded.archivo_nombre,
    entregada_at = excluded.entregada_at;

insert into public.calificaciones (
  id,
  entrega_id,
  nota,
  comentario,
  calificado_por
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    91,
    'Procedimiento claro y resultados bien justificados.',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000002',
    88.50,
    'Buen análisis; faltó explicar una de las fórmulas utilizadas.',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000003',
    74,
    'La solución es correcta, pero la entrega fue posterior al plazo.',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000004',
    95,
    'Excelente integración entre validación, base de datos y almacenamiento.',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000005',
    '40000000-0000-4000-8000-000000000005',
    86,
    'Funciona correctamente; conviene mejorar los mensajes de error.',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000006',
    '40000000-0000-4000-8000-000000000007',
    93,
    'Argumentación sólida y referencias pertinentes.',
    '10000000-0000-4000-8000-000000000003'
  ),
  (
    '50000000-0000-4000-8000-000000000007',
    '40000000-0000-4000-8000-000000000008',
    89,
    'Texto bien estructurado; revisar la uniformidad de las citas.',
    '10000000-0000-4000-8000-000000000003'
  )
on conflict (id) do update
set entrega_id = excluded.entrega_id,
    nota = excluded.nota,
    comentario = excluded.comentario,
    calificado_por = excluded.calificado_por;

commit;
