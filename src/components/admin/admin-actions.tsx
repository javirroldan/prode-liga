"use client";

import { useActionState } from "react";
import { syncMatchday, syncLive, recalculatePoints } from "@/actions/admin";

export function SyncMatchdayButton({ matchday }: { matchday: number }) {
  const [, formAction, pending] = useActionState<unknown, FormData>(
    async () => {
      return syncMatchday(matchday);
    },
    null
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-black hover:bg-green-400 transition-colors disabled:opacity-50"
      >
        {pending ? "Sincronizando..." : `Sincronizar Fecha ${matchday}`}
      </button>
    </form>
  );
}

export function SyncLiveButton() {
  const [, formAction, pending] = useActionState<unknown, FormData>(
    async () => {
      return syncLive();
    },
    null
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
      >
        {pending ? "Actualizando..." : "Actualizar en vivo"}
      </button>
    </form>
  );
}

export function RecalculateButton() {
  const [, formAction, pending] = useActionState<unknown, FormData>(
    async () => {
      return recalculatePoints();
    },
    null
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
      >
        {pending ? "Recalculando..." : "Recalcular puntos"}
      </button>
    </form>
  );
}
