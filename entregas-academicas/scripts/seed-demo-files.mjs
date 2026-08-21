import { createClient } from "@supabase/supabase-js";

import { DEMO_USERS } from "./demo-users.mjs";

const DEMO_FILES = [
  {
    tareaId: "30000000-0000-4000-8000-000000000001",
    estudianteId: "10000000-0000-4000-8000-000000000004",
    nombre: "modelacion-costos-carlos.pdf",
    titulo: "Modelacion de costos - Carlos Mendoza",
  },
  {
    tareaId: "30000000-0000-4000-8000-000000000001",
    estudianteId: "10000000-0000-4000-8000-000000000005",
    nombre: "modelacion-costos-maria.pdf",
    titulo: "Modelacion de costos - Maria Loor",
  },
  {
    tareaId: "30000000-0000-4000-8000-000000000001",
    estudianteId: "10000000-0000-4000-8000-000000000006",
    nombre: "modelacion-costos-luis.pdf",
    titulo: "Modelacion de costos - Luis Moreira",
  },
  {
    tareaId: "30000000-0000-4000-8000-000000000003",
    estudianteId: "10000000-0000-4000-8000-000000000004",
    nombre: "formulario-supabase-carlos.pdf",
    titulo: "Formulario Supabase - Carlos Mendoza",
  },
  {
    tareaId: "30000000-0000-4000-8000-000000000003",
    estudianteId: "10000000-0000-4000-8000-000000000006",
    nombre: "formulario-supabase-luis.pdf",
    titulo: "Formulario Supabase - Luis Moreira",
  },
  {
    tareaId: "30000000-0000-4000-8000-000000000003",
    estudianteId: "10000000-0000-4000-8000-000000000008",
    nombre: "formulario-supabase-juan.pdf",
    titulo: "Formulario Supabase - Juan Alcivar",
  },
  {
    tareaId: "30000000-0000-4000-8000-000000000005",
    estudianteId: "10000000-0000-4000-8000-000000000005",
    nombre: "ensayo-identidad-maria.pdf",
    titulo: "Ensayo de identidad - Maria Loor",
  },
  {
    tareaId: "30000000-0000-4000-8000-000000000005",
    estudianteId: "10000000-0000-4000-8000-000000000007",
    nombre: "ensayo-identidad-andrea.pdf",
    titulo: "Ensayo de identidad - Andrea Mera",
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

function createPdf(title) {
  const content = `BT /F1 18 Tf 72 720 Td (${title}) Tj ET`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n",
    `4 0 obj\n<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new Blob([pdf], { type: "application/pdf" });
}

const admin = DEMO_USERS.find((user) => user.rol === "admin");
const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { error: authError } = await supabase.auth.signInWithPassword({
  email: admin.email,
  password,
});

if (authError) {
  throw authError;
}

for (const file of DEMO_FILES) {
  const path = `${file.tareaId}/${file.estudianteId}/${file.nombre}`;
  const { error } = await supabase.storage
    .from("entregas-alumnos")
    .upload(path, createPdf(file.titulo), {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`No se pudo cargar ${path}: ${error.message}`);
  }

  console.log(`✓ ${path}`);
}

await supabase.auth.signOut({ scope: "local" });
