
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AAYNA — Looking good, simplified.",
  description:
    "Discover and book salon & grooming services in your location. Starting in Dhaka, Bangladesh.",
  applicationName: "AAYNA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
