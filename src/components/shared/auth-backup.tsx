"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Montado en el root layout: instancia el browser client una vez por página
// para que onAuthStateChange escriba el backup localStorage en TODAS las
// páginas (dashboard/admin incluidas), no solo donde se use Supabase en cliente.
export function AuthBackup() {
  useEffect(() => {
    createClient();
  }, []);
  return null;
}
