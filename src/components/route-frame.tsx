"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ApiStatus } from "@/components/api-status";

export function RouteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return <>{children}<ApiStatus /></>;
  }
  return (
    <>
      <div className="site-shell">
        <Navbar />
        <div className="site-container main-region"><main className="main-content">{children}</main></div>
        <Footer />
      </div>
      {/* <ApiStatus /> */}
    </>
  );
}
