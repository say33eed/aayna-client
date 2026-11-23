"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

/** Persistent notification host; follows Aayna's data-theme setting. */
export function AaynaToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const element = document.documentElement;
    const update = () => setTheme(element.dataset.theme === "dark" ? "dark" : "light");
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      position="top-center"
      theme={theme}
      richColors={false}
      closeButton
      duration={4000}
      visibleToasts={4}
      mobileOffset="16px"
      gap={10}
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          fontFamily: "var(--font-nunito), Arial, sans-serif",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    />
  );
}
