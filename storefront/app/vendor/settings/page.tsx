"use client"
import { useState } from "react"
import Button from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Field, Input } from "@/components/ui/Field"
import Shell, { useVendor } from "@/components/vendor/Shell"
import { vendorApi } from "@/lib/vendor"

function Inner() {
  const { shop, setShop, toast } = useVendor(); const [busy, setBusy] = useState(false)
  return (<form className="max-w-2xl space-y-6" onSubmit={async (e) => {
    e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget), g = (k: string) => String(f.get(k) || "").trim()
    try { const d = await vendorApi("/me", { name: g("name"), phone: g("phone"), wave: g("wave"), om: g("om"), address: g("address") }); setShop(d.shop); toast("Coordonnées enregistrées.") } catch (er: any) { toast(er.message, true) } finally { setBusy(false) } }}>
    <Card><CardHeader><h2 className="text-lg font-bold">Commandes</h2></CardHeader><CardBody className="space-y-4">
      <Field label="Nom de la boutique" hint={`Votre nom reste privé. Vos clients voient seulement votre identifiant public : ${shop.code ?? "en cours d'attribution"}.`}>{(id) => <Input id={id} name="name" defaultValue={shop.name} required />}</Field>
      <Field label="WhatsApp des commandes" hint="Chaque nouvelle commande de votre boutique est signalée sur ce numéro.">{(id) => <Input id={id} name="phone" defaultValue={shop.phone} required data-testid="set-phone" />}</Field>
      <Field label="Adresse de la boutique" hint="Là où le livreur Lx récupère le colis.">{(id) => <Input id={id} name="address" defaultValue={shop.address ?? ""} />}</Field></CardBody></Card>
    <Card><CardHeader><h2 className="text-lg font-bold">Paiements des clients</h2></CardHeader><CardBody className="space-y-4">
      <p className="text-sm text-slate-600">Vos clients vous paient directement sur vos numéros. Si un numéro est vide, ce moyen de paiement n&apos;est pas proposé pour vos produits.</p>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Numéro Wave">{(id) => <Input id={id} name="wave" defaultValue={shop.wave_number ?? ""} placeholder="77 000 00 00" data-testid="set-wave" />}</Field>
        <Field label="Numéro Orange Money">{(id) => <Input id={id} name="om" defaultValue={shop.om_number ?? ""} placeholder="77 000 00 00" data-testid="set-om" />}</Field></div></CardBody></Card>
    <Button size="lg" loading={busy} data-testid="save-settings">Enregistrer</Button></form>)
}
export default function VendorSettings() { return <Shell title="Ma boutique" subtitle="Vos coordonnées et vos moyens de paiement."><Inner /></Shell> }
