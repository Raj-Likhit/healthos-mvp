import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthOS | Emergency Clinical Orchestrator",
  description: "Advanced Emergency Response & Forensic Triage System",
};

import StatusBar from "@/components/StatusBar";
import ToastProvider from "@/components/ToastProvider";
import AuthGate from "@/components/AuthGate";
import CommandPalette from "@/components/CommandPalette";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col transition-colors duration-300 pt-10"
        suppressHydrationWarning
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          src="/scripts/theme-init.js"
        />
        <StatusBar />
        <ToastProvider />
        <CommandPalette />
        <AuthGate>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </AuthGate>
      </body>
    </html>
  );
}
