"use client";

import { AaynaSelect } from "@/components/ui/aayna-select";
import Link from "next/link";
import { AdminCategoryManager } from "@/components/dashboard/admin-category-manager";
import Image from "next/image";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { ActionSpinner } from "@/components/ui/action-spinner";
import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Pencil, Plus, Search, Scissors, Trash2, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { notify } from "@/lib/notifications";
import { formatAaynaPrice } from "@/lib/locale";

type Service = { _id: string; serviceName: string; category: string; description: string; price: number; duration: number; image: string; images?: string[]; status: "active" | "inactive" };
type Form = Omit<Service, "_id">;
const empty: Form = { serviceName: "", category: "", description: "", price: 0, duration: 30, image: "", images: [], status: "active" };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/admin/services${path}`, { ...init, credentials: "include", cache: "no-store", headers: { "Content-Type": "application/json", ...init.headers } });
  const json = await response.json().catch(() => null) as { success?: boolean; message?: string; data?: T } | null;
  if (!response.ok || !json?.success) throw new Error(json?.message || `Request failed (${response.status}).`);
  return json.data as T;
}
export function AdminServices() {
  const [rows, setRows] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryMode, setCategoryMode] = useState<"select" | "custom">("select");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setRows(await request<Service[]>("/")); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load services."); }
    finally { setLoading(false); }
  }, []);
  const loadCategories = useCallback(async () => {
    try { setCategories(await request<string[]>("/categories")); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load categories."); }
  }, []);
  useEffect(() => { const controller = new AbortController(); queueMicrotask(() => { if (!controller.signal.aborted) { void load(); void loadCategories(); } }); return () => controller.abort(); }, [load, loadCategories]);
  function openForm(service?: Service) { setCategoryMode("select"); setCustomCategory(""); void loadCategories(); setError(""); setNotice(""); setEditing(service?._id || "new"); setImageUrl(""); setForm(service ? { serviceName: service.serviceName, category: service.category, description: service.description, price: service.price, duration: service.duration, image: service.image, images: service.images?.length ? service.images : (service.image ? [service.image] : []), status: service.status } : empty); }
  const gallery = form.images?.length ? form.images : (form.image ? [form.image] : []);
  function addImage(url: string) {
    setForm((current) => {
      const existing = current.images?.length ? current.images : (current.image ? [current.image] : []);
      if (existing.includes(url) || existing.length >= 10) return current;
      return { ...current, images: [...existing, url], image: current.image || url };
    });
  }
  function removeImage(url: string) {
    setForm((current) => {
      const images = (current.images?.length ? current.images : [current.image]).filter((v) => v && v !== url);
      return { ...current, images, image: current.image === url ? (images[0] || "") : current.image };
    });
  }
  async function upload(files?: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (selected.length + gallery.length > 10) { setError("A service can have up to 10 images."); return; }
    if (selected.some((file) => file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))) { setError("Each file must be JPEG, PNG, WebP or GIF and under 5 MB."); return; }
    setUploading(true); setError("");
    try {
      for (const file of selected) {
        const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("Could not read image.")); reader.onload = () => resolve(String(reader.result).split(",")[1] || ""); reader.readAsDataURL(file); });
        const result = await request<{ url: string }>("/image", { method: "POST", body: JSON.stringify({ image: base64, mime: file.type }) });
        addImage(result.url);
      }
    } catch (e) { const message = e instanceof Error ? e.message : "Image upload failed. Images already uploaded remain in the gallery."; setError(message); notify.error(message); }
    finally { setUploading(false); }
  }
  function addUrl() {
    try {
      const parsed = new URL(imageUrl.trim());
      if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password || parsed.href.length > 2048) throw new Error();
      if (gallery.includes(parsed.href)) { setError("That image is already in the gallery."); return; }
      if (gallery.length >= 10) { setError("Maximum 10 images."); return; }
      addImage(parsed.href); setImageUrl(""); setError("");
    } catch { setError("Enter a valid public HTTPS image URL (maximum 2048 characters)."); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!editing || busy || uploading) return;
    if (!form.image || !gallery.length) { setError("Add at least one service image first."); return; }
    if (categoryMode === "custom" && (customCategory.trim().length < 2 || customCategory.trim().length > 60)) { setError("Custom category must be 2–60 characters."); return; }
    if (categoryMode === "select" && !form.category) { setError("Choose a category."); return; }
    setBusy(true); setError("");
    try {
      let nextForm = form;
      if (categoryMode === "custom") {
        const result = await request<{ name: string }>("/categories", { method: "POST", body: JSON.stringify({ name: customCategory.trim() }) });
        nextForm = { ...form, category: result.name };
        setCategories((previous) => [...new Set([...previous, result.name])]);
      }
      await request(editing === "new" ? "/" : `/${editing}`, { method: editing === "new" ? "POST" : "PATCH", body: JSON.stringify(nextForm) });
      setEditing(null); const message = editing === "new" ? "Service created successfully." : "Service updated successfully."; setNotice(""); notify.success(message); await load();
    } catch (e) { const message = e instanceof Error ? e.message : "Could not save service."; setError(message); notify.error(message); }
    finally { setBusy(false); }
  }
  async function toggle(row: Service) {
    setBusy(true); setError(""); setNotice("");
    try { await request(`/${row._id}/status`, { method: "PATCH", body: JSON.stringify({ status: row.status === "active" ? "inactive" : "active" }) }); setNotice(""); notify.success(row.status === "active" ? "Service hidden successfully." : "Service published successfully."); await load(); }
    catch (e) { const message = e instanceof Error ? e.message : "Unable to change status."; setError(message); notify.error(message); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!confirmDelete) return;
    setBusy(true); setError("");
    try { await request(`/${confirmDelete}`, { method: "DELETE" }); setConfirmDelete(null); setNotice(""); notify.success("Service deleted successfully."); await load(); }
    catch (e) { setConfirmDelete(null); const message = e instanceof Error ? e.message : "Unable to delete service."; setError(message); notify.error(message); }
    finally { setBusy(false); }
  }
  const shown = rows.filter((s) => (filter === "all" || s.status === filter) && `${s.serviceName} ${s.category}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="aaynaServices" aria-label="Manage services">
    <header className="aaynaServices_head"><div><span className="aaynaServices_kicker">THE COLLECTION / ADMIN</span><h2>Services</h2><p>Curate what your customers can discover and book.</p></div><button className="aaynaServices_primary" onClick={() => openForm()}><Plus size={18}/> Add service</button></header>
    <AdminCategoryManager onChanged={() => { void load(); void loadCategories(); }} />
    <div className="aaynaServices_numbers"><div><strong>{rows.length}</strong><span>Total services</span></div><div><strong>{rows.filter((r) => r.status === "active").length}</strong><span>Live on Aayna</span></div><div><strong>{rows.filter((r) => r.status === "inactive").length}</strong><span>Hidden services</span></div></div>
    <div className="aaynaServices_toolbar"><label><Search size={18}/><input aria-label="Search services" placeholder="Find a service…" value={query} onChange={(e) => setQuery(e.target.value)}/></label><AaynaSelect aria-label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></AaynaSelect></div>
    {notice && <p className="aaynaServices_notice" role="status">{notice}</p>}{error && <p className="aaynaServices_error" role="alert">{error}</p>}
    {loading ? <CardGridSkeleton count={6} title="Loading managed services" /> : shown.length === 0 ? <div className="aaynaServices_empty"><Scissors size={28}/><h3>{rows.length ? "No matching services" : "Build your collection"}</h3><p>{rows.length ? "Try another search or status." : "Your first service is one step away."}</p>{!rows.length && <button className="aaynaServices_primary" onClick={() => openForm()}><Plus size={17}/> Create first service</button>}</div> : <div className="aaynaServices_list">{shown.map((s) => <article className="aaynaServices_item" key={s._id}><div className="aaynaServices_photo">{s.image ? <Image src={s.image} alt="" width={72} height={72} unoptimized/> : <Scissors size={20}/>}</div><div className="aaynaServices_info"><h3><Link className="aaynaDash_serviceLink" href={`/services/${encodeURIComponent(s._id)}`}>{s.serviceName}</Link></h3><p>{s.category} · {s.duration} min</p><small>{s.description}</small></div><div className="aaynaServices_price">{formatAaynaPrice(s.price)}</div><span className="aaynaServices_status" data-status={s.status}>{s.status}</span><div className="aaynaServices_actions"><Link className="aaynaDash_serviceDetailsLink" href={`/services/${encodeURIComponent(s._id)}`}>View service</Link><button onClick={() => openForm(s)} aria-label={`Edit ${s.serviceName}`}><Pencil size={16}/> Edit</button><button disabled={busy} onClick={() => void toggle(s)}>{busy ? <><ActionSpinner label="Updating service status" /> Updating…</> : s.status === "active" ? "Deactivate" : "Activate"}</button><button className="aaynaServices_danger" disabled={busy} onClick={() => setConfirmDelete(s._id)} aria-label={`Delete ${s.serviceName}`}><Trash2 size={16}/></button></div></article>)}</div>}
    {editing && <div className="aaynaServices_overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy && !uploading) setEditing(null); }}><div className="aaynaServices_dialog" role="dialog" aria-modal="true" aria-labelledby="service-editor-title"><header><div><span className="aaynaServices_kicker">SERVICE EDITOR</span><h2 id="service-editor-title">{editing === "new" ? "Create service" : "Edit service"}</h2></div><button type="button" aria-label="Close editor" onClick={() => setEditing(null)} disabled={busy || uploading}><X size={21}/></button></header><form onSubmit={(e) => void save(e)}><div className="aaynaServices_fields"><label>Service name<input required minLength={2} maxLength={100} value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })}/></label><label>Category<AaynaSelect required={categoryMode === "select"} value={categoryMode === "custom" ? "__custom__" : form.category} onChange={(e) => { if (e.target.value === "__custom__") { setCategoryMode("custom"); } else { setCategoryMode("select"); setForm({ ...form, category: e.target.value }); } }}><option value="">Choose category</option>{[...new Set([...categories, ...(form.category ? [form.category] : [])])].map((cat) => <option key={cat} value={cat}>{cat}</option>)}<option value="__custom__">+ Create a new category</option></AaynaSelect>{categoryMode === "custom" && <input required minLength={2} maxLength={60} aria-label="New category name" placeholder="Enter new category name" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}/>}</label><label className="aaynaServices_wide">Description<textarea required minLength={10} maxLength={3000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><label>Price (BDT)<input type="number" required min="0.01" step="0.01" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}/></label><label>Duration (minutes)<input type="number" required min="1" max="1440" step="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}/></label><label>Status<AaynaSelect value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Form["status"] })}><option value="active">Active</option><option value="inactive">Inactive</option></AaynaSelect></label><div className="aaynaServices_wide aaynaGalleryEditor"><strong>Service gallery <span>({gallery.length}/10)</span></strong><p>Upload images, then choose a cover for service cards. The order below is the gallery order.</p><label className="aaynaServices_upload"><ImagePlus size={20}/>{uploading ? <><ActionSpinner label="Uploading service images" /> Uploading…</> : "Add image files"}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading || busy || gallery.length >= 10} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }}/></label><div className="aaynaGalleryEditor_url"><input type="url" aria-label="Image URL" placeholder="Optional: paste any direct HTTPS image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={busy || uploading}/><button type="button" disabled={busy || uploading || !imageUrl.trim()} onClick={addUrl}>Add link</button></div><small>JPEG, PNG, WebP or GIF · 5 MB per file · maximum 10 images. Links are optional.</small>{gallery.length > 0 && <div className="aaynaGalleryEditor_grid">{gallery.map((url, index) => <div className="aaynaGalleryEditor_tile" key={url}><Image src={url} alt={`Service image ${index + 1}`} width={96} height={96} unoptimized/><span>{index + 1}</span><button type="button" className={form.image === url ? "isCover" : ""} onClick={() => setForm((current) => ({ ...current, image: url }))}>{form.image === url ? "Cover selected" : "Set as cover"}</button><button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => removeImage(url)} disabled={busy || uploading}><X size={15}/></button></div>)}</div>}</div></div>{error && <p className="aaynaServices_error" role="alert">{error}</p>}<footer><button type="button" onClick={() => setEditing(null)} disabled={busy || uploading}>Cancel</button><button className="aaynaServices_primary" type="submit" disabled={busy || uploading || !form.image}>{busy ? <><ActionSpinner label="Saving service" /> Saving…</> : editing === "new" ? "Create service" : "Save changes"}</button></footer></form></div></div>}
    {confirmDelete && <div className="aaynaServices_overlay"><div className="aaynaServices_confirm" role="alertdialog" aria-modal="true" aria-label="Confirm service deletion"><h2>Delete this service?</h2><p>This cannot be undone. Services with appointment history must be deactivated instead.</p><div><button onClick={() => setConfirmDelete(null)} disabled={busy}>Keep service</button><button className="aaynaServices_delete" onClick={() => void remove()} disabled={busy}>{busy ? <><ActionSpinner label="Deleting service" /> Deleting…</> : "Delete permanently"}</button></div></div></div>}
  </section>;
}
