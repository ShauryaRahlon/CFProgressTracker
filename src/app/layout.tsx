import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CF Tracker",
  description: "Competitive Programming Progress Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {/* Minimal Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex h-14 items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-white/10 flex items-center justify-center">
                  <span className="text-sm font-bold">CF</span>
                </div>
                <span className="text-sm font-medium text-white/80">Tracker</span>
              </Link>

              <nav className="flex items-center gap-6">
                <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">
                  Contests
                </Link>
                <Link href="/admin/add-users" className="text-sm text-white/50 hover:text-white transition-colors">
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="pt-14 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}