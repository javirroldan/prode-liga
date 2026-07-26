import { Navbar } from "@/components/shared/navbar";

export default function RankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
