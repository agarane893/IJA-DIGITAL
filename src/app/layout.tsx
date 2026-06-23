import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/AuthProvider";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import { Toaster } from "sonner";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ija Digital | Gestion intelligente pour Restaurants & Salons de thé",
  description: "Optimisez vos opérations, réduisez le gaspillage et offrez une expérience client interactive de classe mondiale en Tunisie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("scroll-smooth", sansFont.variable, serifFont.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <RealtimeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </RealtimeProvider>
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
