import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "O/L Study Tracker Pro",
  description: "Premium study management system for G.C.E. O/L candidates",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
