"use client";

import { createAuthClient } from "better-auth/react";

// Better Auth is reached through this Next.js origin, never directly through
// Render. The same-origin browser cookie is then available to SSR dashboards.
export const authClient = createAuthClient({
  baseURL: typeof window === "undefined" ? "http://localhost:3000" : window.location.origin,
  fetchOptions: { credentials: "same-origin" },
});
