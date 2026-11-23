"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { notify } from "@/lib/notifications";
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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoStatus, setPhotoStatus] = useState<"empty" | "checking" | "valid" | "invalid">("empty");

  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => {
    if (!image.trim() || photo) return;
    let active = true;
    const timer = setTimeout(() => {
      try {
        const url = new URL(image.trim());
        if (url.protocol !== "https:" || url.username || url.password || url.hostname === "ibb.co" || url.hostname === "ibb.co.com") {
          setPhotoStatus("invalid"); return;
        }
        setPhotoStatus("checking");
        const preview = new Image();
        preview.onload = () => { if (active) setPhotoStatus("valid"); };
        preview.onerror = () => { if (active) setPhotoStatus("invalid"); };
        preview.src = url.href;
      } catch { setPhotoStatus("invalid"); }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [image, photo]);

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      showError("Choose a JPEG, PNG, WebP, or GIF image under 5 MB.");
      event.target.value = "";
      return;
    }
    setError("");
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
    if (file) {
      setImage("");
      setPhotoStatus("empty");
    }
  }

  async function uploadPhoto(file: File): Promise<string> {
    const encoded = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read your photo."));
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.readAsDataURL(file);
    });
    const response = await fetch("/api/profile/image", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: encoded, mime: file.type }),
    });
    const result = await response.json() as { success?: boolean; data?: { url?: string }; message?: string };
    if (!response.ok || !result.success || !result.data?.url) throw new Error(result.message || "Photo upload failed.");
    return result.data.url;
  }
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const passwordValid = password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password);

  function destination(role: "admin" | "customer") {
    const requested = new URLSearchParams(window.location.search).get("next");
    if (requested && requested.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\") && !requested.includes(":") && !requested.includes("%")) {
      if (requested.startsWith("/services/") && role === "customer") return requested;
      if (requested === `/dashboard/${role}` || requested === "/dashboard") return requested;
    }
    return `/dashboard/${role}`;
  }

  function showError(message: string) {
    setError(message);
    notify.error(message, { id: "aayna-auth-error" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (register && (!name.trim() || !passwordValid || password !== confirm)) {
      showError("Use 6+ characters with uppercase and lowercase letters, and matching passwords.");
      return;
    }
    if (register && !photo && image.trim() && photoStatus !== "valid") {
      showError("Enter a direct HTTPS image URL that loads in the preview, or upload a photo.");
      return;
    }
    setBusy(true);
    try {
      const result = register
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, image: image.trim() || undefined })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        showError(result.error.message || "Authentication failed. Please try again.");
        return;
      }
      if (register && photo) {
        try {
          const uploadedUrl = await uploadPhoto(photo);
          const updated = await authClient.updateUser({ image: uploadedUrl });
          if (updated.error) throw new Error(updated.error.message || "Photo could not be saved.");
        } catch (uploadError) {
          showError(`Account created, but the photo was not saved: ${uploadError instanceof Error ? uploadError.message : "Upload failed"}. You can sign in normally.`);
          return;
        }
      }
      notify.success(register ? "Account created successfully." : "Signed in successfully.", { id: "aayna-auth-success" });
      const role = result.data?.user && "role" in result.data.user && result.data.user.role === "admin" ? "admin" : "customer";
      router.replace(destination(role));
      router.refresh();
    } catch {
      showError("Could not reach the authentication service. Please try again.");
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
      if (result.error) showError(result.error.message || "Google sign-in is unavailable.");
    } catch {
      showError("Google sign-in is unavailable. Check OAuth configuration.");
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
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <span>Profile photo <span className="text-xs font-normal text-[var(--muted)]">(optional)</span></span>
              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] p-4 text-sm transition-colors hover:border-[#FF5100]">
                Choose photo to upload (max 5 MB)
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={selectPhoto} disabled={busy}/>
              </label>
              <span className="text-center text-xs font-normal text-[var(--muted)]">or use a direct image URL</span>
              <input aria-label="Direct profile image URL" className={inputClass} value={image} onChange={(e)=>{setImage(e.target.value);setPhoto(null);setPhotoPreview("");setPhotoStatus(e.target.value.trim() ? "checking" : "empty");}} type="url" maxLength={2048} placeholder="https://example.com/photo.jpg" disabled={busy}/>
              {(photoPreview || (image.trim() && photoStatus === "valid")) && <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview || image.trim()} alt="Profile photo preview" className="h-14 w-14 rounded-full border border-[var(--border)] object-cover"/>
                <span className="text-xs font-normal text-[var(--muted)]">{photo ? photo.name : "Image preview loaded"}</span>
              </div>}
              {!photo && image.trim() && photoStatus === "checking" && <span className="text-xs font-normal text-[var(--muted)]">Checking image URL…</span>}
              {!photo && image.trim() && photoStatus === "invalid" && <span role="alert" className="text-xs font-normal text-red-500">This URL does not load as an image. Use a direct image link or upload a photo.</span>}
            </div>
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
          <Button type="submit" disabled={busy} className="mt-2 h-12 w-full">{busy ? "Please wait…" : register ? "Create account" : "Sign in"} <ArrowRight size={17} aria-hidden="true"/></Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">{register ? "Already have an account?" : "New to AAYNA?"}{" "}<Link className="font-bold text-[var(--foreground)] underline underline-offset-4 hover:text-[#FF5100]" href={register ? "/sign-in" : "/sign-up"}>{register ? "Sign in" : "Create an account"}</Link></p>
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">Public registration creates customer accounts only. Admin access is assigned privately.</p>
    </section>
  );
}
