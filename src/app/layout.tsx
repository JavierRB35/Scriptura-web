import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/shared/ui/site-header";
import { SiteFooter } from "@/shared/ui/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Scriptura",
    template: "%s · Scriptura",
  },
  description:
    "Comunidad digital abierta e interconfesional para leer las Escrituras, comprender sus contenidos, compartir reflexiones y descubrir otras perspectivas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* La cabecera consulta la sesión (cookies): se transmite en streaming
            para no bloquear el prerenderizado estático del armazón. */}
        <Suspense fallback={<div className="h-[57px] border-b border-border bg-surface" />}>
          <SiteHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
