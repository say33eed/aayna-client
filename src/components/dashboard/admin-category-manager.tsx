"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { notify } from "@/lib/notifications";
import { ActionSpinner } from "@/components/ui/action-spinner";

type Category = { name: string; image: string };
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/admin/services${path}`, { ...init, credentials: "include", cache: "no-store", headers: { "Content-Type": "application/json", ...init.headers } });
  const json = await response.json().catch(() => null) as { success?: boolean; message?: string; data?: T } | null;
  if (!response.ok || !json?.success) throw new Error(json?.message || "Request failed.");
  return json.data as T;
}
export function AdminCategoryManager({ onChanged }: { onChanged: () => void }) {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try { setItems(await request<Category[]>("/category-details")); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load categories."); }
  }, []);
  useEffect(() => {
    const task = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);
  function edit(item: Category) { setEditing(item); setName(item.name); setImage(item.image); setError(""); }
  async function upload(file?: File) {
    if (!file) return;
    if (!(["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) || file.size > 5 * 1024 * 1024) { setError("Use JPEG, PNG, WebP or GIF under 5 MB."); return; }
    setBusy(true); setError("");
    try {
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("Could not read image.")); reader.onload = () => resolve(String(reader.result).split(",")[1] || ""); reader.readAsDataURL(file); });
      const result = await request<{ url: string }>("/image", { method: "POST", body: JSON.stringify({ image: base64, mime: file.type }) });
      setImage(result.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !image) { setError("Upload a category picture before saving."); return; }
    setBusy(true); setError("");
    try {
      await request(`/categories/${encodeURIComponent(editing.name)}`, { method: "PATCH", body: JSON.stringify({ name: name.trim(), image }) });
      notify.success("Category updated."); setEditing(null); await refresh(); onChanged();
    } catch (e) { const message = e instanceof Error ? e.message : "Unable to update category."; setError(message); notify.error(message); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true); setError("");
    try {
      const result = await request<{ moved: number }>(`/categories/${encodeURIComponent(deleting.name)}`, { method: "DELETE" });
      notify.success(`Category deleted. ${result.moved} service(s) moved to Miscellaneous.`);
      setDeleting(null); await refresh(); onChanged();
    } catch (e) { const message = e instanceof Error ? e.message : "Unable to delete category."; setError(message); notify.error(message); }
    finally { setBusy(false); }
  }
  return <section className="aaynaCategoryManager" aria-label="Manage service categories">
    <div className="aaynaCategoryManager_heading"><div><span className="aaynaServices_kicker">THE COLLECTION / CATEGORIES</span><h3>Categories.</h3><p>Each category has its own picture, independent of service images.</p></div></div>
    <div className="aaynaCategoryManager_grid">{items.map((item) => <article key={item.name} className="aaynaCategoryManager_item"><div className="aaynaCategoryManager_photo">{item.image ? <Image src={item.image} alt="" width={100} height={100} unoptimized /> : <ImagePlus size={24} />}</div><strong>{item.name}</strong><button type="button" onClick={() => edit(item)}><Pencil size={15} /> Edit</button>{item.name.toLocaleLowerCase("en") !== "miscellaneous" && <button type="button" onClick={() => { setDeleting(item); setError(""); }}><Trash2 size={15} /> Delete</button>}</article>)}</div>
    {error && !editing && <p className="aaynaServices_error" role="alert">{error}</p>}
    {editing && <div className="aaynaServices_overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setEditing(null); }}><div className="aaynaServices_dialog" role="dialog" aria-modal="true" aria-labelledby="category-editor-title"><header><div><span className="aaynaServices_kicker">CATEGORY EDITOR</span><h2 id="category-editor-title">Edit category</h2></div><button type="button" aria-label="Close editor" disabled={busy} onClick={() => setEditing(null)}><X size={21}/></button></header><form onSubmit={(e) => void save(e)}><div className="aaynaServices_fields"><label className="aaynaServices_wide">Category name<input required minLength={2} maxLength={60} value={name} disabled={editing.name.toLocaleLowerCase("en") === "miscellaneous"} onChange={(e) => setName(e.target.value)} /></label><div className="aaynaServices_wide"><strong>Category picture</strong><p>Upload one permanent category image (JPEG, PNG, WebP or GIF, maximum 5 MB).</p>{image && <div className="aaynaCategoryManager_preview"><Image src={image} alt="Selected category picture" width={180} height={120} unoptimized /></div>}<label className="aaynaServices_upload"><ImagePlus size={20}/>{busy ? <><ActionSpinner label="Uploading category picture"/> Uploading…</> : "Upload category picture"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }}/></label></div></div>{error && <p className="aaynaServices_error" role="alert">{error}</p>}<footer><button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="aaynaServices_primary" disabled={busy || !image || !name.trim()}>{busy ? <><ActionSpinner label="Saving category"/> Saving…</> : "Save category"}</button></footer></form></div></div>}
    {deleting && <div className="aaynaServices_overlay" role="presentation"><div className="aaynaServices_confirm" role="dialog" aria-modal="true" aria-labelledby="category-delete-title"><h2 id="category-delete-title">Delete {deleting.name}?</h2><p>All services in this category will be moved to Miscellaneous. No services will be deleted.</p>{error && <p role="alert" className="aaynaServices_error">{error}</p>}<div><button type="button" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button type="button" className="aaynaServices_delete" disabled={busy} onClick={() => void remove()}>{busy ? "Deleting…" : "Delete category"}</button></div></div></div>}
  </section>;
}
