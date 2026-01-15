import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codeforces Tracker",
  description: "College Contest & Upsolving Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}