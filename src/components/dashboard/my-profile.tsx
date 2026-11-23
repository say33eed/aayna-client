"use client";

import { ContentSkeleton, Skeleton } from "@/components/ui/loading-skeleton";
import { ActionSpinner } from "@/components/ui/action-spinner";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Check, ImagePlus, LoaderCircle, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { notify } from "@/lib/notifications";
import "./my-profile.css";

type Profile = { id: string; name: string; email: string; phone: string; image: string; role: "admin" | "customer"; emailVerified: boolean };
type ApiResult = { success?: boolean; message?: string; data?: Profile };

export function MyProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, { credentials: "include", cache: "no-store" });
      const result = await response.json() as ApiResult;
      if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to load profile.");
      setProfile(result.data); setName(result.data.name); setPhone(result.data.phone || ""); setImage(result.data.image || "");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load profile."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/profile/me`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as ApiResult;
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to load profile.");
        return result.data;
      })
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setName(data.name);
        setPhone(data.phone || "");
        setImage(data.image || "");
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load profile.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const changed = Boolean(profile && (name.trim() !== profile.name || phone.trim() !== profile.phone || image.trim() !== profile.image));
  const busy = saving || uploading;

  async function upload(file?: File) {
    if (!file) return;
    setError(""); setNotice("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setError("Choose a JPEG, PNG or WebP image up to 3 MB."); notify.error("Choose a JPEG, PNG or WebP image up to 3 MB."); return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error("Unable to read image."));
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${API_BASE_URL}/api/profile/image`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, mime: file.type }) });
      const result = await response.json() as { success?: boolean; message?: string; data?: { url?: string } };
      if (!response.ok || !result.success || !result.data?.url) throw new Error(result.message || "Image upload failed.");
      setImage(result.data.url); setNotice(""); notify.success("Image uploaded. Save changes to update your profile.");
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Image upload failed."; setError(message); notify.error(message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || !profile) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), phone: phone.trim(), image: image.trim() }) });
      const result = await response.json() as ApiResult;
      if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to save profile.");
      setProfile(result.data); setName(result.data.name); setPhone(result.data.phone); setImage(result.data.image);
      setNotice(""); notify.success("Profile saved successfully.");
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Unable to save profile."; setError(message); notify.error(message); }
    finally { setSaving(false); }
  }

  if (loading) return <section className="aayna-loading-page" role="status" aria-label="Loading your profile"><Skeleton shape="line" style={{ width: "40%", height: 32 }}/><div className="aayna-loading-service"><Skeleton className="aayna-loading-service-photo"/><ContentSkeleton rows={6} title="Loading your profile"/></div></section>;
  if (!profile) return <section className="aaynaProfile_loading" role="alert">{error || "Your profile is unavailable."} <button type="button" onClick={() => void load()}>Try again</button></section>;
  return <section className="aaynaProfile" aria-label="My profile">
    <div className="aaynaProfile_intro"><div><span className="aaynaProfile_kicker">ACCOUNT / PERSONAL DETAILS</span><h2>Made personal</h2><p>Your information, just the way you want it. Only you can edit this profile.</p></div><span className="aaynaProfile_secure"><ShieldCheck size={16}/> Private account</span></div>
    <div className="aaynaProfile_layout">
      <div className="aaynaProfile_identity"><span className="aaynaProfile_kicker">YOUR IDENTITY</span><div className="aaynaProfile_photo">{image.startsWith("https://") ? <Image src={image} alt="Profile avatar" width={160} height={160} unoptimized referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <UserRound size={46} strokeWidth={1.3}/>}</div><h3>{profile.name}</h3><p>{profile.email}</p><span className="aaynaProfile_role">{profile.role === "admin" ? "Administrator" : "Customer"}</span><div className="aaynaProfile_readonly"><ShieldCheck size={17}/><span>Account role and email are managed securely and cannot be edited here.</span></div></div>
      <form className="aaynaProfile_form" onSubmit={(event) => void save(event)}><div className="aaynaProfile_formTop"><div><span className="aaynaProfile_kicker">PROFILE SETTINGS</span><h3>Personal information</h3></div><span className="aaynaProfile_editable">Editable</span></div>
        <div className="aaynaProfile_fields"><label>Full name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} disabled={busy}/></label><label>Phone number <small>Optional</small><input type="tel" autoComplete="tel" maxLength={25} placeholder="+880 1XXXXXXXXX" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={busy}/></label><label>Email address <small>Read-only</small><input type="email" value={profile.email} disabled aria-describedby="aaynaProfile_emailHelp"/></label><p id="aaynaProfile_emailHelp" className="aaynaProfile_hint">Your email is linked to your sign-in account.</p></div>
        <div className="aaynaProfile_imageSection"><h4>Profile image</h4><p>Upload a photo or paste a public HTTPS image link.</p><div className="aaynaProfile_uploadRow"><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="aaynaProfile_file" onChange={(event) => void upload(event.target.files?.[0])} aria-label="Choose a profile image"/><button type="button" onClick={() => fileRef.current?.click()} disabled={busy} aria-busy={uploading}>{uploading ? <ActionSpinner/> : <ImagePlus size={17}/>} {uploading ? "Uploading photo…" : "Upload photo"}</button><span>JPEG, PNG, WebP · Max 3 MB</span></div><label className="aaynaProfile_urlLabel">Image URL<input type="url" placeholder="https://example.com/photo.jpg" maxLength={2048} value={image} onChange={(event) => setImage(event.target.value)} disabled={busy}/></label></div>
        {error && <p className="aaynaProfile_error" role="alert">{error}</p>}{notice && <p className="aaynaProfile_notice" role="status"><Check size={16}/>{notice}</p>}
        <div className="aaynaProfile_actions"><button type="button" className="aaynaProfile_reset" disabled={!changed || busy} onClick={() => { setName(profile.name); setPhone(profile.phone); setImage(profile.image); setError(""); setNotice(""); }}><RotateCcw size={16}/> Discard changes</button><button type="submit" className="aaynaProfile_save" disabled={!changed || busy}>{saving ? <LoaderCircle size={17} className="aaynaProfile_spin"/> : <Check size={17}/>} {saving ? "Saving…" : "Save changes"}</button></div>
      </form>
    </div>
  </section>;
}
