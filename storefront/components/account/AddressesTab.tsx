"use client"
import { MapPin, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { Field, Input } from "@/components/ui/Field"
import { useToast } from "@/components/ui/Toast"
import { customerApi, useCustomer } from "@/lib/customer"

export default function AddressesTab() {
  const { customer, refresh } = useCustomer(); const toast = useToast(); const [adding, setAdding] = useState(false), [busy, setBusy] = useState(false)
  const list = customer?.addresses ?? []
  return (<div className="space-y-4">
    {!list.length && !adding && <EmptyState icon={MapPin}>Aucune adresse enregistrée. Ajoutez-en une pour commander plus vite.</EmptyState>}
    <ul className="grid gap-3 md:grid-cols-2">{list.map((a) => (<li key={a.id} data-testid="address" className="flex items-start justify-between gap-3 rounded-3xl border border-line p-5">
      <div className="text-sm"><p className="font-bold">{a.first_name} {a.last_name !== "-" ? a.last_name : ""}</p><p className="text-slate-600">{a.address_1}, {a.city}</p><p className="text-slate-500">{a.phone}</p></div>
      <button aria-label="Supprimer l'adresse" className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-bissap" onClick={async () => { try { await customerApi(`/store/customers/me/addresses/${a.id}`, undefined, "DELETE"); await refresh(); toast("Adresse supprimée.") } catch (e: any) { toast(e.message, true) } }}><Trash2 className="size-4" /></button></li>))}</ul>
    {adding ? <form className="space-y-3 rounded-3xl bg-surface p-5" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget), g = (k: string) => String(f.get(k) || "").trim(); const [first, ...rest] = g("name").split(" ")
      try { await customerApi("/store/customers/me/addresses", { first_name: first, last_name: rest.join(" ") || "-", address_1: g("address"), city: g("city") || "Dakar", country_code: "sn", phone: g("phone").replace(/\D/g, "") }); await refresh(); setAdding(false); toast("Adresse enregistrée.") } catch (er: any) { toast(er.message, true) } finally { setBusy(false) } }}>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Nom du destinataire">{(id) => <Input id={id} name="name" defaultValue={`${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim()} required />}</Field><Field label="Téléphone">{(id) => <Input id={id} name="phone" defaultValue={customer?.phone} required />}</Field></div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]"><Field label="Adresse (quartier, repère)">{(id) => <Input id={id} name="address" required />}</Field><Field label="Ville">{(id) => <Input id={id} name="city" defaultValue="Dakar" />}</Field></div>
      <div className="flex gap-2"><Button loading={busy} data-testid="save-address">Enregistrer</Button><Button type="button" variant="secondary" onClick={() => setAdding(false)}>Annuler</Button></div></form>
      : <Button variant="secondary" onClick={() => setAdding(true)} data-testid="add-address"><Plus className="size-4" />Ajouter une adresse</Button>}</div>)
}
