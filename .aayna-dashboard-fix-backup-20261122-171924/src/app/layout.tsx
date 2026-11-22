import type { Metadata } from "next";
import { Nunito_Sans, Quicksand, Hind_Siliguri } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ApiStatus } from "@/components/api-status";
import "./globals.css";

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
        <div className="site-shell">
          <Navbar />
          <div className="site-container main-region">
            <main className="main-content">{children}</main>
          </div>
          <Footer />
        </div>
      <ApiStatus />
      </body>
    </html>
  );
}
