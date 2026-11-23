"use client";
import { AaynaSelect } from "@/components/ui/aayna-select";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { JournalArticle } from "@/lib/journal";
import { notify } from "@/lib/notifications";
const categories = ["Hair Care", "Skin Care", "Nail Care", "Wellness"] as const;
type Form = Pick<JournalArticle, "title" | "excerpt" | "body" | "category" | "image" | "published" | "featured">;
const empty: Form = {title:"",excerpt:"",body:"",category:"Hair Care",image:"",published:false,featured:false};
async function request(path: string, init: RequestInit = {}) {
  const r = await fetch(`/api/admin/journal${path}`, {credentials:"include",cache:"no-store",...init,headers:{"Content-Type":"application/json",...init.headers}});
  const data = await r.json().catch(()=>null);
  if (!r.ok || !data?.success) throw new Error(data?.message || "Request failed.");
  return data;
}
export function AdminJournal() {
  const [rows,setRows] = useState<JournalArticle[]>([]);
  const [form,setForm] = useState<Form>(empty);
  const [editing,setEditing] = useState<string | null>(null);
  const [busy,setBusy] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [error,setError] = useState("");
  const [confirmDelete,setConfirmDelete] = useState<string | null>(null);
  const load = useCallback(async () => { try { const result = await request("/"); setRows(result.data); } catch(e) { setError(e instanceof Error ? e.message : "Could not load tips."); } },[]);
  useEffect(()=>{const controller = new AbortController();queueMicrotask(()=>{if(!controller.signal.aborted) void load();});return()=>controller.abort();},[load]);
  function start(row?: JournalArticle) {setEditing(row?._id || "new");setForm(row ? {title:row.title,excerpt:row.excerpt,body:row.body,category:row.category,image:row.image,published:row.published,featured:row.featured}:empty);setError("");}
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 5*1024*1024 || !["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) {setError("Choose a JPEG, PNG, WebP or GIF under 5 MB.");return;}
    setUploading(true);setError("");
    try {const image = await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error("Unable to read image."));reader.onload=()=>resolve(String(reader.result).split(",")[1]||"");reader.readAsDataURL(file);});
      const r = await fetch("/api/admin/services/image",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({image,mime:file.type})});const result=await r.json();if(!r.ok||!result.success||!result.data?.url)throw new Error(result.message||"Upload failed.");setForm(f=>({...f,image:result.data.url}));
    }catch(e){setError(e instanceof Error?e.message:"Upload failed.");}finally{setUploading(false);}
  }
  async function save(e: React.FormEvent) {e.preventDefault();if(busy||uploading||!editing)return;setBusy(true);setError("");try{await request(editing==="new"?"/":`/${editing}`,{method:editing==="new"?"POST":"PATCH",body:JSON.stringify(form)});notify.success("Journal article saved.");setEditing(null);await load();}catch(e){const msg=e instanceof Error?e.message:"Save failed.";setError(msg);notify.error(msg);}finally{setBusy(false);}}
  async function remove(id:string) {setBusy(true);try{await request(`/${id}`,{method:"DELETE"});setConfirmDelete(null);notify.success("Article deleted.");await load();}catch(e){setError(e instanceof Error?e.message:"Delete failed.");}finally{setBusy(false);}}
  return <section className="aaynaJournal_admin"><div className="aaynaJournal_adminHead"><div><span className="aaynaJournal_kicker">CONTENT MANAGEMENT</span><h2>Self-care journal</h2><p>Publish useful, reviewed tips for Aayna visitors.</p></div><button onClick={()=>start()}>+ New article</button></div>{error&&<p role="alert" className="aaynaJournal_error">{error}</p>}{editing&&<form className="aaynaJournal_form" onSubmit={save}><h3>{editing==="new"?"Create article":"Edit article"}</h3><label>Title<input required minLength={5} maxLength={120} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></label><label>Category<AaynaSelect value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value as Form["category"]}))}>{categories.map(c=><option key={c}>{c}</option>)}</AaynaSelect></label><label>Short preview<textarea required minLength={15} maxLength={240} value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))}/></label><label>Article content (separate paragraphs with blank lines)<textarea rows={12} required minLength={80} maxLength={12000} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))}/></label><label>Image URL<input type="url" required value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))}/></label><label>Or upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>void upload(e.target.files?.[0])}/></label>{form.image&&<div className="aaynaJournal_preview"><Image src={form.image} alt="Article preview" fill unoptimized sizes="200px" style={{objectFit:"cover"}} /></div>}<label className="aaynaJournal_check"><input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))}/> Published</label><label className="aaynaJournal_check"><input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))}/> Feature on homepage</label><div className="aaynaJournal_actions"><button type="submit" disabled={busy||uploading}>{busy?"Saving…":uploading?"Uploading…":"Save article"}</button><button type="button" onClick={()=>setEditing(null)}>Cancel</button></div></form>}<div className="aaynaJournal_rows">{rows.map(row=><div key={row._id} className="aaynaJournal_row"><div><strong>{row.title}</strong><small>{row.category} · {row.published?"Published":"Draft"}{row.featured?" · Featured":""}</small></div><div className="aaynaJournal_actions"><button onClick={()=>start(row)}>Edit</button>{confirmDelete===row._id?<><button disabled={busy} onClick={()=>void remove(row._id)}>Confirm delete</button><button onClick={()=>setConfirmDelete(null)}>Cancel</button></>:<button onClick={()=>setConfirmDelete(row._id)}>Delete</button>}</div></div>)}{rows.length===0&&<p>No tips yet. Create the first article to get started.</p>}</div></section>;
}
