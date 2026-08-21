import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { DEMO_USERS } from "./demo-users.mjs";

const DEMO_DRAFTS = [
  {
    estudianteId: "10000000-0000-4000-8000-000000000004",
    nombre: "analisis-estadistico-ventas-carlos.pdf",
  },
  {
    estudianteId: "10000000-0000-4000-8000-000000000005",
    nombre: "modelo-negocio-cafe-maria.pdf",
  },
  {
    estudianteId: "10000000-0000-4000-8000-000000000006",
    nombre: "estadistica-ventas-luis.pdf",
  },
  {
    estudianteId: "10000000-0000-4000-8000-000000000007",
    nombre: "panel-academico-accesible-andrea.pdf",
  },
  {
    estudianteId: "10000000-0000-4000-8000-000000000008",
    nombre: "tradiciones-manabi-juan.pdf",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const password = process.env.DEMO_USER_PASSWORD;

if (!supabaseUrl || !publishableKey || !password) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y DEMO_USER_PASSWORD.",
  );
}

for (const draft of DEMO_DRAFTS) {
  const student = DEMO_USERS.find((user) => user.id === draft.estudianteId);
  if (!student) throw new Error(`No se encontró al estudiante ${draft.estudianteId}.`);

  const pdfPath = join(process.cwd(), "public", "demo-pdfs", draft.nombre);
  const pdf = await readFile(pdfPath);
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: student.email,
    password,
  });
  if (authError) throw new Error(`No se pudo iniciar sesión como ${student.email}: ${authError.message}`);

  const path = `${student.id}/${draft.nombre}`;
  const { error: uploadError } = await supabase.storage
    .from("borradores-alumnos")
    .upload(path, pdf, { contentType: "application/pdf", upsert: true });

  await supabase.auth.signOut({ scope: "local" });
  if (uploadError) throw new Error(`No se pudo cargar ${path}: ${uploadError.message}`);

  console.log(`✓ ${student.nombreCompleto}: ${draft.nombre}`);
}
