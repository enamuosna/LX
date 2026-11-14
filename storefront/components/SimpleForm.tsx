"use client"
import { useState } from "react"
import { post } from "@/lib/medusa"
export type Field = { name: string; placeholder: string; type?: string; textarea?: boolean; required?: boolean; defaultValue?: string }
export default function SimpleForm({ endpoint, fields, extra, submitLabel, okMessage, onDone }: { endpoint: string; fields: Field[]; extra?: Record<string, string>; submitLabel: string; okMessage: string; onDone?: () => void }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null), [busy, setBusy] = useState(false)
  return (<form onSubmit={async (e) => {
    e.preventDefault(); setBusy(true); setMsg(null); const form = e.currentTarget
    const body: Record<string, string> = { ...extra }; new FormData(form).forEach((v, k) => (body[k] = String(v)))
    try { await post(endpoint, body); setMsg({ ok: true, t: okMessage }); form.reset(); onDone?.() } catch (er: any) { setMsg({ ok: false, t: er.message }) } finally { setBusy(false) }
  }}>
    {msg && <div className={`alert alert-${msg.ok ? "success" : "danger"}`}>{msg.t}</div>}
    {fields.map((f) => <div key={f.name} className="form-group">{f.textarea
      ? <textarea className="input" name={f.name} rows={4} placeholder={f.placeholder} required={f.required !== false} defaultValue={f.defaultValue} />
      : <input className="input" name={f.name} type={f.type || "text"} placeholder={f.placeholder} required={f.required !== false} defaultValue={f.defaultValue} />}</div>)}
    <button className="primary-btn" disabled={busy} style={{ borderRadius: 40 }}>{busy ? "Envoi…" : submitLabel}</button></form>)
}
