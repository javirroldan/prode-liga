import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export const AUTH_BACKUP_KEY = "prode-liga-auth-backup";

let backupListenerAttached = false;

export function createClient(): SupabaseClient {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Backup de sesión en localStorage: los contexts que limpian cookies al
  // cerrar la PWA (ahorro de batería/datos, browsers OEM) suelen conservar
  // localStorage. Se adjunta UNA sola vez por página (el client es singleton).
  if (!backupListenerAttached && typeof window !== "undefined") {
    backupListenerAttached = true;
    supabase.auth.onAuthStateChange((event, session) => {
      try {
        if (session) {
          localStorage.setItem(
            AUTH_BACKUP_KEY,
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              saved_at: Date.now(),
            })
          );
        } else if (event === "SIGNED_OUT") {
          localStorage.removeItem(AUTH_BACKUP_KEY);
        }
      } catch {
        // storage lleno/bloqueado: el flujo normal sigue por cookies
      }
    });
  }

  return supabase;
}
