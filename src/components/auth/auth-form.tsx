"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, UserRound, Mail, LockKeyhole, Camera, Check } from "lucide-react";
import { GoogleMark } from "@/components/auth/google-mark";
import { ActionSpinner } from "@/components/ui/action-spinner";
import "./auth-editorial.css";
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

  const inputClass = "auth-input";
  return (
    <section className="auth-editorial" aria-label={register ? "Create your Aayna account" : "Sign in to Aayna"}>
      <div className="auth-story" aria-hidden="true">
        <div className="auth-art">
          <div className="auth-art-mirror" />
          <div className="auth-art-shadow" />
          <div className="auth-art-shelf" />
          <div className="auth-art-jar" />
          <div className="auth-art-brush auth-art-brush-one" />
          <div className="auth-art-brush auth-art-brush-two" />
          <div className="auth-art-brush auth-art-brush-three" />
        </div>
        <div className="auth-story-copy">
          <span className="auth-story-line" />
          <p className="auth-overline">A little time for yourself</p>
          <h2>{register ? <>Your next look<br/>starts here.</> : <>Your moments,<br/>beautifully booked.</>}</h2>
          <p>Discover thoughtful beauty and grooming experiences, all in one place.</p>
          <span className="auth-story-index">AAYNA / EVERYDAY, REIMAGINED</span>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="auth-overline">{register ? "AAYNA / GET STARTED" : "AAYNA / WELCOME BACK"}</p>
            <h1>{register ? "Create an account" : "Welcome back"}</h1>
            <p>{register ? "A better way to discover and book your next appointment." : "Sign in to pick up right where you left off."}</p>
          </div>
          <form onSubmit={submit} className="auth-fields">
            {register && <>
              <label className="auth-field"><span>Full name</span><span className="auth-input-wrap"><UserRound size={18} aria-hidden="true"/><input className={inputClass} value={name} onChange={(e)=>setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" placeholder="Your full name"/></span></label>
            </>}
            <label className="auth-field"><span>Email address</span><span className="auth-input-wrap"><Mail size={18} aria-hidden="true"/><input className={inputClass} value={email} onChange={(e)=>setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="you@example.com"/></span></label>
            <label className="auth-field"><span>Password</span><span className="auth-input-wrap"><LockKeyhole size={18} aria-hidden="true"/><input className="auth-input auth-password-input" value={password} onChange={(e)=>setPassword(e.target.value)} type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} required minLength={6} placeholder={register ? "Create a password" : "Enter your password"}/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)} className="auth-eye">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
            {register && <>
              <p className="auth-hint" aria-live="polite">6+ characters, including uppercase and lowercase letters.</p>
              <label className="auth-field"><span>Confirm password</span><span className="auth-input-wrap"><LockKeyhole size={18} aria-hidden="true"/><input className={inputClass} value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" autoComplete="new-password" required placeholder="Repeat your password"/></span></label>
              <div className="auth-photo">
                <span className="auth-photo-label">Profile photo <small>Optional</small></span>
                <label className="auth-photo-upload"><Camera size={17} aria-hidden="true"/> Choose a photo <span>JPEG, PNG, WebP or GIF · up to 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={selectPhoto} disabled={busy}/></label>
                <details className="auth-photo-url"><summary>Or add a photo URL</summary><input aria-label="Direct profile image URL" className={inputClass} value={image} onChange={(e)=>{setImage(e.target.value);setPhoto(null);setPhotoPreview("");setPhotoStatus(e.target.value.trim() ? "checking" : "empty");}} type="url" maxLength={2048} placeholder="https://example.com/photo.jpg" disabled={busy}/></details>
                {(photoPreview || (image.trim() && photoStatus === "valid")) && <div className="auth-photo-preview"><NextImage src={photoPreview || image.trim()} alt="Profile photo preview" width={72} height={72} unoptimized/><span><Check size={14} aria-hidden="true"/>{photo ? photo.name : "Image preview loaded"}</span></div>}
                {!photo && image.trim() && photoStatus === "checking" && <p className="auth-hint">Checking image URL…</p>}
                {!photo && image.trim() && photoStatus === "invalid" && <p role="alert" className="auth-error">This image URL could not be loaded. Try a direct HTTPS link or upload a photo.</p>}
              </div>
            </>}
            {error && <p role="alert" className="auth-error">{error}</p>}
            <Button type="submit" disabled={busy} aria-busy={busy} className="auth-submit">{busy ? <><ActionSpinner/>{register ? "Creating account…" : "Signing in…"}</> : <>{register ? "Create account" : "Sign in"}<ArrowRight size={18} aria-hidden="true"/></>}</Button>
          </form>
          <div className="auth-divider"><span>or</span></div>
          <button type="button" onClick={googleSignIn} disabled={busy} aria-busy={busy} className="auth-google">{busy ? <ActionSpinner/> : <GoogleMark/>}{busy ? "Connecting…" : "Continue with Google"}</button>
          <p className="auth-switch">{register ? "Already have an account?" : "New to Aayna?"} <Link href={register ? "/sign-in" : "/sign-up"}>{register ? "Sign in" : "Create an account"}</Link></p>
          {register && <p className="auth-disclaimer">Registration creates a customer account. Admin access is assigned privately.</p>}
        </div>
      </div>
    </section>
  );
}
