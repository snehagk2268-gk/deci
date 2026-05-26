import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeciTrace — AI Decision Audit System",
  description:
    "Record, audit, and analyze every AI decision your organization makes. Built for compliance, transparency, and continuous improvement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
