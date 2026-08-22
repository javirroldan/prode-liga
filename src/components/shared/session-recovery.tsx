"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { recoverSession } from "@/lib/recover-session";

// Montado en el landing "/": si hay sesión viva o recuperable desde el
// backup localStorage, manda directo al dashboard sin mostrar la pantalla
// pública. Cubre el caso del middleware que no redirige "/" por ser público.
export function SessionRecovery() {
  const router = useRouter();

  useEffect(() => {
    recoverSession().then((ok) => {
      if (ok) router.replace("/dashboard");
    });
  }, [router]);

  return null;
}
