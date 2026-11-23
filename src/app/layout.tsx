import "@/components/journal.css";
import type { Metadata } from "next";
import { Nunito_Sans, Quicksand, Hind_Siliguri } from "next/font/google";
import { RouteFrame } from "@/components/route-frame";
import { AaynaToaster } from "@/components/aayna-toaster";
import "./globals.css";
import "./aayna-not-found.css";
import "./dashboard-global.css";
import "./aayna-loading.css";
import "./aayna-action-loading.css";
import "../components/dashboard/admin-services.css";

const nunitoSans = Nunito_Sans({ subsets: ["latin"], display: "swap", variable: "--font-nunito" });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-wordmark" });
const hindSiliguri = Hind_Siliguri({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-bangla" });

export const metadata: Metadata = {
  title: { default: "AAYNA — Looking good, simplified.", template: "%s | AAYNA" },
  description: "Discover and book salon & grooming services in your location. Starting in Dhaka, Bangladesh.",
  applicationName: "AAYNA",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${nunitoSans.variable} ${quicksand.variable} ${hindSiliguri.variable}`}>
        <RouteFrame>{children}</RouteFrame>
        <AaynaToaster />
      </body>
    </html>
  );
}
