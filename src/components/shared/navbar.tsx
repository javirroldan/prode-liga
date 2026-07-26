"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, LayoutDashboard, ListOrdered, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Partidos", icon: LayoutDashboard },
  { href: "/fixture", label: "Fixture", icon: ListOrdered },
  { href: "/ranking", label: "Ranking", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Trophy className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-lg font-bold text-white">Prode Liga</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                      isActive
                        ? "text-blue-400"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "text-blue-400"
                      : "text-white/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <div className="h-0.5 w-6 bg-blue-500 rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
