"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";

export function RankingTabs({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const hasFecha = searchParams.has("fecha");

  return (
    <Tabs defaultValue={hasFecha ? "fecha" : "general"}>
      <TabsList className="bg-white/5 border-white/10">
        <TabsTrigger value="general" className="data-[state=active]:bg-blue-500/20">
          General
        </TabsTrigger>
        <TabsTrigger value="fecha" className="data-[state=active]:bg-blue-500/20">
          Por Fecha
        </TabsTrigger>
        <TabsTrigger value="stats" className="data-[state=active]:bg-blue-500/20">
          <BarChart3 className="mr-1 h-4 w-4" />
          Estadisticas
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
