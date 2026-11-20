import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "AAYNA — Looking good, simplified.", template: "%s | AAYNA" },
  description: "Discover and book salon & grooming services in your location. Starting in Dhaka, Bangladesh.",
  applicationName: "AAYNA",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={geist.className}><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
