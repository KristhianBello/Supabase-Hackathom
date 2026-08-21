# Contexto del Proyecto: Plataforma de Entregas Académicas Seguras

## 1. Resumen Ejecutivo
Plataforma web académica construida bajo el principio de **Zero Trust**, diseñada para resolver la gestión, entrega y calificación de tareas escolares/universitarias. El núcleo de la seguridad, la autorización granular y la integridad de los datos residen directamente en el motor de base de datos y en el sistema de almacenamiento de objetos, evitando depender de validaciones superficiales en el frontend.

---

## 2. Ejes Temáticos del Reto

* **Auth (Autenticación y Perfiles):**
  * Manejo de sesiones mediante Supabase Auth.
  * Extensión del perfil del usuario con tipado estricto de roles: `admin`, `profesor` y `estudiante`.

* **RLS (Row Level Security):**
  * Reglas declarativas en base de datos para restringir lectura, inserción y mutación.
  * Prevención estricta de ataques de manipulación directa (tampering) y escalamiento de privilegios.

* **Storage Seguro:**
  * Bucket privado para documentos de entrega (`entregas-alumnos`).
  * Aislamiento por rutas jerárquicas: `{tarea_id}/{estudiante_id}/{archivo.pdf}`.
  * Políticas de Storage para evitar vulnerabilidades de tipo IDOR (Insecure Direct Object Reference).

* **Auditoría:**
  * Trazabilidad forense e inmutable de eventos críticos (cambios de notas, entregas a destiempo, intentos de mutación).
  * Registro de instantáneas del estado anterior y posterior de los registros con marcas de tiempo.

---

## 3. Definición de Roles y Reglas de Negocio

### 3.1. Roles
1. **Estudiante:**
   * Visualiza únicamente las asignaturas y tareas en las que está formalmente inscrito.
   * Puede consultar y subir únicamente su propia entrega por tarea.
   * Puede actualizar su entrega siempre y cuando la tarea **no haya sido calificada aún**.
   * Solo tiene acceso de lectura y escritura a su subcarpeta asignada en Storage.

2. **Profesor:**
   * Gestiona tareas de las asignaturas que tiene asignadas.
   * Visualiza y descarga todas las entregas correspondientes a sus cursos.
   * Es el único rol facultado para asignar y actualizar calificaciones.

3. **Administrador:**
   * Supervisión global del sistema sin restricciones por materia.
   * Acceso exclusivo para consultar y auditar la bitácora histórica de eventos (`audit_logs`).

---

## 4. Matriz Lógica de Permisos

| Operación / Recurso | Estudiante | Profesor | Administrador |
| :--- | :--- | :--- | :--- |
| **Cursos y Tareas (Lectura)** | Solo sus cursos inscritos | Solo sus cursos asignados | Acceso global |
| **Entrega de Tareas (Creación)** | Permitido (propia entrega) | No aplica | No aplica |
| **Entrega de Tareas (Lectura)** | Solo entrega propia | Entregas de sus cursos | Acceso global |
| **Calificaciones (Modificación)**| Bloqueado | Permitido (sus cursos) | Control total |
| **Storage (Subida de PDFs)**   | Solo su ruta personal | Bloqueado | Permitido |
| **Storage (Descarga de PDFs)** | Solo su archivo | Archivos de sus cursos| Acceso global |
| **Bitácora de Auditoría**       | Bloqueado (`403`) | Bloqueado (`403`) | Lectura total |

---

## 5. Arquitectura Técnica

* **Enfoque Arquitectónico:** Monolito full-stack con **Next.js (App Router)** conectado directamente a Supabase mediante `@supabase/ssr` (sin backend intermedio).
* **Flujo de Autorización:**
  * Las peticiones desde Server Components y Server Actions propagan automáticamente el JWT del usuario autenticado.
  * El motor de base de datos evalúa las políticas RLS directamente en cada consulta.
* **Manejo de Archivos:**
  * Subidas de archivos directas desde el cliente al bucket privado para validar en vivo el aislamiento por carpetas.

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx             # Inicio de sesión
│   ├── dashboard/
│   │   ├── student/page.tsx           # Vista y subida de entregas
│   │   ├── teacher/page.tsx           # Revisión y calificación
│   │   └── admin/page.tsx             # Panel de auditoría forense
├── lib/
│   └── supabase/
│       ├── client.ts                  # Cliente Browser
│       ├── server.ts                  # Cliente Server (Cookies / SSR)
│       └── middleware.ts              # Control de sesión
└── middleware.ts                      # Protección perimetral de rutas
```

---

## 6. Plan para la Demo en Vivo

1. **Flujo Válido (Happy Path):**
   * El estudiante inicia sesión, sube un documento PDF a su carpeta privada y registra la entrega.
   * El profesor ingresa, visualiza la entrega, descarga el archivo y asigna una calificación.

2. **Demostración de Acceso Denegado (RLS en Base de Datos):**
   * El estudiante intenta mutar su propia calificación a través de la consola del navegador o llamada directa a la API.
   * **Resultado esperado:** Operación rechazada / `403 Forbidden` / `0 rows updated`.

3. **Demostración de Acceso Denegado (Storage IDOR):**
   * El estudiante intenta generar una URL de descarga o listar la carpeta de otro compañero en el bucket.
   * **Resultado esperado:** `403 Access Denied`.

4. **Verificación de Auditoría:**
   * El estudiante intenta consultar los registros de auditoría $\rightarrow$ Acceso denegado.
   * El administrador inicia sesión y visualiza la traza completa con fecha, actor y cambios de notas.