"use client";

import { useState, useTransition } from "react";
import { removeUserFromTournament } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, CheckCircle2, AlertCircle, Mail } from "lucide-react";

interface Participant {
  user: {
    id: string;
    name: string;
    nickname: string;
    email: string;
  };
  totalPoints: number;
  joinedAt: Date;
}

export function UserManagement({
  participants,
  tournamentId,
}: {
  participants: Participant[];
  tournamentId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [localParticipants, setLocalParticipants] = useState(participants);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRemove = (userId: string, nickname: string) => {
    if (!confirm(`¿Quitar a ${nickname} del torneo? Se eliminarán todos sus pronósticos.`)) return;

    startTransition(async () => {
      const result = await removeUserFromTournament(userId, tournamentId);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `${nickname} fue removido del torneo` });
        setLocalParticipants((prev) => prev.filter((p) => p.user.id !== userId));
      }
    });
  };

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5" />
          Participantes del Torneo
          <Badge variant="secondary" className="ml-2 bg-white/10 text-white/70 border-white/10">
            {localParticipants.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-white/50">
          Gestiona los participantes. Quitar un usuario elimina sus pronósticos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}

        {localParticipants.length === 0 ? (
          <p className="py-8 text-center text-white/50">
            No hay participantes en este torneo
          </p>
        ) : (
          <div className="space-y-2">
            {localParticipants.map((p) => (
              <div
                key={p.user.id}
                className="flex items-center gap-3 rounded-lg bg-white/5 p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                  {p.user.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{p.user.nickname}</p>
                  <p className="flex items-center gap-1 text-xs text-white/40 truncate">
                    <Mail className="h-3 w-3" />
                    {p.user.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{p.totalPoints} pts</p>
                </div>
                <Button
                  onClick={() => handleRemove(p.user.id, p.user.nickname)}
                  disabled={isPending}
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  title={`Quitar ${p.user.nickname}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
