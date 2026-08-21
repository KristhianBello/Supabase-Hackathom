import { createClient } from "@supabase/supabase-js";

import { DEMO_USERS } from "./demo-users.mjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_USER_PASSWORD;

if (!supabaseUrl || !secretKey || !password) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY y DEMO_USER_PASSWORD.",
  );
}

if (password.length < 12) {
  throw new Error("DEMO_USER_PASSWORD debe tener al menos 12 caracteres.");
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { data: listedUsers, error: listError } =
  await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

if (listError) {
  throw listError;
}

const usersByEmail = new Map(
  listedUsers.users.map((user) => [user.email?.toLowerCase(), user]),
);

for (const demoUser of DEMO_USERS) {
  const existingUser = usersByEmail.get(demoUser.email.toLowerCase());
  const attributes = {
    email: demoUser.email,
    password,
    email_confirm: true,
    user_metadata: { nombre_completo: demoUser.nombreCompleto },
    app_metadata: { rol: demoUser.rol },
  };

  if (existingUser && existingUser.id !== demoUser.id) {
    throw new Error(
      `${demoUser.email} ya existe con un UUID diferente (${existingUser.id}).`,
    );
  }

  const { error } = existingUser
    ? await supabase.auth.admin.updateUserById(demoUser.id, attributes)
    : await supabase.auth.admin.createUser({ id: demoUser.id, ...attributes });

  if (error) {
    throw new Error(`No se pudo preparar ${demoUser.email}: ${error.message}`);
  }

  console.log(`✓ ${demoUser.rol}: ${demoUser.email}`);
}
