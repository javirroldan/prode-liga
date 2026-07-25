"use client";

import { useActionState } from "react";
import { joinTournament } from "@/actions/tournaments";

interface JoinState {
  error?: string;
  success?: boolean;
  tournamentName?: string;
}

export function JoinTournamentForm() {
  const [state, formAction, pending] = useActionState<JoinState, FormData>(
    async (_prev, formData) => {
      const result = await joinTournament(formData);
      return result ?? {};
    },
    {}
  );

  return (
    <div className="space-y-3">
      {state.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
          Te uniste a {state.tournamentName}
        </div>
      )}
      <form action={formAction} className="flex gap-2">
        <input
          name="inviteCode"
          placeholder="Codigo del torneo"
          className="flex h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "..." : "Unirse"}
        </button>
      </form>
    </div>
  );
}
