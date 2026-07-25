import { Navbar } from "@/components/shared/navbar";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400 border border-yellow-500/20">
            ADMIN
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
