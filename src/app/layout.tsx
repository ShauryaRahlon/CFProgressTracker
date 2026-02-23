import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CF Tracker",
  description: "Competitive Programming Progress Tracker",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <SiteHeader
          isAdmin={isAdmin}
          userName={session?.user?.name?.split(" ")[0]}
        />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}