"use client"
import { useState } from "react"
import Button from "@/components/ui/Button"
import { Field, Input, Textarea } from "@/components/ui/Field"
import Modal from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { vendorApi } from "@/lib/vendor"
import type { Item } from "./labels"

const TITLE = { add: "Entrée de stock", remove: "Sortie de stock", set: "Corriger le stock" }
export default function StockAdjustModal({ item, mode, onDone, onClose }: { item: Item; mode: "add" | "remove" | "set"; onDone: () => void; onClose: () => void }) {
  const toast = useToast(); const [busy, setBusy] = useState(false), [qty, setQty] = useState(mode === "set" ? String(item.stocked) : "")
  const after = mode === "add" ? item.stocked + (Number(qty) || 0) : mode === "remove" ? item.stocked - (Number(qty) || 0) : Number(qty) || 0
  return (<Modal title={`${TITLE[mode]} : ${item.title}`} onClose={onClose} footer={<><Button variant="secondary" type="button" onClick={onClose}>Annuler</Button><Button type="submit" form="adj" loading={busy} data-testid="save-adjust">Enregistrer</Button></>}>
    <form id="adj" className="space-y-4" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget)
      try { await vendorApi("/inventory/adjust", { product_id: item.id, mode, quantity: Number(qty), reason: f.get("reason") || undefined, note: f.get("note") }); toast("Stock mis à jour."); onDone(); onClose() } catch (er: any) { toast(er.message, true); setBusy(false) }
    }}>
      <div className="grid grid-cols-3 gap-3 text-center text-sm"><div className="rounded-2xl bg-surface p-3"><div className="text-xs text-slate-500">Physique</div><b className="font-display text-xl">{item.stocked}</b></div><div className="rounded-2xl bg-surface p-3"><div className="text-xs text-slate-500">Réservé</div><b className="font-display text-xl">{item.reserved}</b></div><div className="rounded-2xl bg-brand-50 p-3"><div className="text-xs text-brand-600">Après</div><b className="font-display text-xl text-brand-600" data-testid="after">{after}</b></div></div>
      <Field label={mode === "set" ? "Quantité réelle en rayon" : "Quantité"}>{(id) => <Input id={id} type="number" min={mode === "set" ? 0 : 1} value={qty} onChange={(e) => setQty(e.target.value)} required autoFocus data-testid="adjust-qty" />}</Field>
      {mode === "remove" && <Field label="Motif">{(id) => <select id={id} name="reason" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm"><option value="loss">Perte, casse ou vol</option><option value="adjustment">Autre sortie (usage perso, don…)</option></select>}</Field>}
      <Field label="Note (facultatif)">{(id) => <Textarea id={id} name="note" rows={2} placeholder={mode === "add" ? "ex : livraison fournisseur du 12 novembre" : "ex : article abîmé en rayon"} />}</Field>
    </form></Modal>)
}
