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
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
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
          className="flex h-10 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400 disabled:opacity-50 cursor-pointer"
        >
          {pending ? "..." : "Unirse"}
        </button>
      </form>
    </div>
  );
}
