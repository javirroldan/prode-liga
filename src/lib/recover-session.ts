import { createClient, AUTH_BACKUP_KEY } from "@/lib/supabase/client";
import { syncSession } from "@/actions/auth";

// Recupera la sesión del dispositivo: primero mira si las cookies siguen
// vivas; si fueron limpiadas (Androids/browsers OEM al cerrar la PWA),
// restaura desde el backup localStorage vía syncSession.
// Devuelve true si hay sesión usable al terminar.
export async function recoverSession(): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return true;

  try {
    const raw = localStorage.getItem(AUTH_BACKUP_KEY);
    if (!raw) return false;

    const backup = JSON.parse(raw) as {
      access_token?: string;
      refresh_token?: string;
    };
    if (!backup.access_token || !backup.refresh_token) return false;

    const { ok } = await syncSession(backup.access_token, backup.refresh_token);
    if (!ok) {
      // Backup revocado/expirado: limpiar para no reintentar
      localStorage.removeItem(AUTH_BACKUP_KEY);
      return false;
    }
    return true;
  } catch {
    // JSON corrupto o storage bloqueado
    return false;
  }
}
