import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prode Liga Profesional | Pronósticos de Fútbol",
  description: "Jugá al prode con tus amigos de la Liga Profesional Argentina",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prode Liga",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator && window.location.hostname !== 'localhost'){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
