"use client"
import { useState } from "react"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"
import { Field, Input, Textarea } from "@/components/ui/Field"
import { post } from "@/lib/medusa"

export type FieldDef = { name: string; label: string; placeholder?: string; type?: string; textarea?: boolean; required?: boolean; defaultValue?: string; hint?: string }

/** Formulaire générique : envoie les champs en JSON vers un endpoint de la boutique. */
export default function ServiceForm({ endpoint, fields, extra, submitLabel, okMessage }: { endpoint: string; fields: FieldDef[]; extra?: Record<string, string>; submitLabel: string; okMessage: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null), [busy, setBusy] = useState(false)
  return (<form className="space-y-4" onSubmit={async (e) => {
    e.preventDefault(); setBusy(true); setMsg(null); const form = e.currentTarget
    const body: Record<string, string> = { ...extra }; new FormData(form).forEach((v, k) => (body[k] = String(v)))
    try { await post(endpoint, body); setMsg({ ok: true, t: okMessage }); form.reset() } catch (er: any) { setMsg({ ok: false, t: er.message }) } finally { setBusy(false) }
  }}>
    {msg && <Banner tone={msg.ok ? "success" : "danger"}>{msg.t}</Banner>}
    {fields.map((f) => <Field key={f.name} label={f.label} hint={f.hint}>{(id) => f.textarea
      ? <Textarea id={id} name={f.name} placeholder={f.placeholder} required={f.required !== false} defaultValue={f.defaultValue} />
      : <Input id={id} name={f.name} type={f.type || "text"} placeholder={f.placeholder} required={f.required !== false} defaultValue={f.defaultValue} />}</Field>)}
    <Button size="lg" loading={busy}>{submitLabel}</Button></form>)
}
