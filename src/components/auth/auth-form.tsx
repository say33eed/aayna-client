"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type Mode = "sign-in" | "sign-up";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const register = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordValid = password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password);

  function destination(role: "admin" | "customer") {
    const requested = new URLSearchParams(window.location.search).get("next");
    if (requested && requested.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\") && !requested.includes(":") && !requested.includes("%")) {
      if (requested.startsWith("/services/") && role === "customer") return requested;
      if (requested === `/dashboard/${role}` || requested === "/dashboard") return requested;
    }
    return `/dashboard/${role}`;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(""); setSuccess("");
    if (register && (!name.trim() || !passwordValid || password !== confirm)) {
      setError("Use 6+ characters with uppercase and lowercase letters, and matching passwords.");
      return;
    }
    setBusy(true);
    try {
      const result = register
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, image: image.trim() || undefined })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message || "Authentication failed. Please try again.");
        return;
      }
      setSuccess(register ? "Account created successfully." : "Signed in successfully.");
      const role = result.data?.user && "role" in result.data.user && result.data.user.role === "admin" ? "admin" : "customer";
      router.replace(destination(role));
      router.refresh();
    } catch {
      setError("Could not reach the authentication service. Please try again.");
    } finally { setBusy(false); }
  }

  async function googleSignIn() {
    if (busy) return;
    setError(""); setBusy(true);
    try {
      // Gateway rechecks the server session and redirects by the authoritative role.
      const next = new URLSearchParams(window.location.search).get("next");
      // Better Auth runs on port 5000; use an absolute frontend URL so
      // the OAuth callback cannot resolve /dashboard against the API origin.
      const frontendOrigin = window.location.origin;
      const callbackPath = next && /^\/services\/[a-f0-9]{24}$/i.test(next)
        ? `/dashboard?next=${encodeURIComponent(next)}`
        : "/dashboard";
      const callbackURL = `${frontendOrigin}${callbackPath}`;
      const result = await authClient.signIn.social({ provider: "google", callbackURL });
      if (result.error) setError(result.error.message || "Google sign-in is unavailable.");
    } catch {
      setError("Google sign-in is unavailable. Check OAuth configuration.");
    } finally { setBusy(false); }
  }

  const inputClass = "h-12 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[#FF5100] focus-visible:ring-[3px] focus-visible:ring-[#FF5100]/20";
  return (
    <section className="mx-auto w-full max-w-[440px] py-10 sm:py-16">
      <div className="mb-9 text-center">
        <p className="mb-4 text-xl font-extrabold tracking-[-0.08em]">aayna<span className="text-[#FF5100]">.</span></p>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#FF5100]">{register ? "Join AAYNA" : "Welcome back"}</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">{register ? "Create your account" : "Sign in to AAYNA"}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{register ? "Discover services and manage appointments in one place." : "Your services and appointments, all in one place."}</p>
      </div>
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.035)] sm:p-8">
        <button type="button" onClick={googleSignIn} disabled={busy} className="mb-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-sm font-bold text-[var(--foreground)] transition-colors hover:border-[#FF5100] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FF5100] disabled:opacity-50">
          <span aria-hidden="true" className="font-bold text-[#FF5100]">G</span> Continue with Google
        </button>
        <div className="mb-6 flex items-center gap-3 text-xs text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--border)]"/><span>or use email</span><span className="h-px flex-1 bg-[var(--border)]"/></div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {register && <>
            <label className="flex flex-col gap-2 text-sm font-semibold">Full name<input className={inputClass} value={name} onChange={(e)=>setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" placeholder="Your full name"/></label>
            <label className="flex flex-col gap-2 text-sm font-semibold">Profile image URL <span className="text-xs font-normal text-[var(--muted)]">(optional)</span><input className={inputClass} value={image} onChange={(e)=>setImage(e.target.value)} type="url" placeholder="https://example.com/photo.jpg" /></label>
          </>}
          <label className="flex flex-col gap-2 text-sm font-semibold">Email address<input className={inputClass} value={email} onChange={(e)=>setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="you@example.com"/></label>
          <label className="flex flex-col gap-2 text-sm font-semibold">Password
            <span className="relative"><input className={`${inputClass} pr-12`} value={password} onChange={(e)=>setPassword(e.target.value)} type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} required minLength={6} placeholder="Enter your password"/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-2 text-[var(--muted)] hover:text-[var(--foreground)]">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span>
          </label>
          {register && <>
            <p className="text-xs text-[var(--muted)]" aria-live="polite">Password: 6+ characters, one uppercase and one lowercase letter.</p>
            <label className="flex flex-col gap-2 text-sm font-semibold">Confirm password<input className={inputClass} value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" autoComplete="new-password" required placeholder="Repeat your password"/></label>
          </>}
          {error && <p role="alert" className="rounded-lg border border-red-500/40 p-3 text-sm text-red-500">{error}</p>}
          {success && <p role="status" className="text-sm text-[var(--foreground)]">{success}</p>}
          <Button type="submit" disabled={busy} className="mt-2 h-12 w-full">{busy ? "Please wait…" : register ? "Create account" : "Sign in"} <ArrowRight size={17} aria-hidden="true"/></Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">{register ? "Already have an account?" : "New to AAYNA?"}{" "}<Link className="font-bold text-[var(--foreground)] underline underline-offset-4 hover:text-[#FF5100]" href={register ? "/sign-in" : "/sign-up"}>{register ? "Sign in" : "Create an account"}</Link></p>
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">Public registration creates customer accounts only. Admin access is assigned privately.</p>
    </section>
  );
}
