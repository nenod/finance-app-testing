import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "FinTrack",
  description: "Personal finance & stock portfolio tracker",
};

// Runs synchronously during HTML parsing, before first paint, so the correct
// theme is applied with no flash. Prefers a saved choice, else the OS setting.
// `color-scheme` is set inline (not in CSS) so native UI — form controls, date
// pickers, scrollbars — follows the app theme rather than the OS. Lightning CSS
// mangles a bare `color-scheme` in the `.dark` rule, so we drive it from JS.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-muted/30">
        <header className="border-b bg-background">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
            <Wallet className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">FinTrack</span>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
