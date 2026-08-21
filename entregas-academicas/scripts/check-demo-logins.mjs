import { createClient } from "@supabase/supabase-js";

import { DEMO_USERS } from "./demo-users.mjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const password = process.env.DEMO_USER_PASSWORD;

if (!supabaseUrl || !publishableKey || !password) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y DEMO_USER_PASSWORD.",
  );
}

for (const demoUser of DEMO_USERS) {
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: demoUser.email,
      password,
    });

  if (authError || authData.user?.id !== demoUser.id) {
    throw new Error(
      `Falló el login de ${demoUser.email}: ${authError?.message ?? "UUID inesperado"}`,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, nombre_completo, rol")
    .eq("id", demoUser.id)
    .single();

  if (
    profileError ||
    profile.nombre_completo !== demoUser.nombreCompleto ||
    profile.rol !== demoUser.rol
  ) {
    throw new Error(
      `Perfil inválido para ${demoUser.email}: ${profileError?.message ?? "datos inesperados"}`,
    );
  }

  await supabase.auth.signOut({ scope: "local" });
  console.log(`✓ ${demoUser.rol}: ${demoUser.email}`);
}
