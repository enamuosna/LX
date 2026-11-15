"use client"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"
import Container from "@/components/ui/Container"
import EmptyState from "@/components/ui/EmptyState"
import { Field, Input, Textarea } from "@/components/ui/Field"
import PageHeader from "@/components/ui/PageHeader"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/cn"
import { fcfa, post, store } from "@/lib/medusa"

const PAY: [string, string][] = [["cod", "Paiement à la livraison"], ["mobile_money", "Mobile money (Wave, Orange Money)"], ["card", "Carte bancaire"]]

export default function Checkout() {
  const { cart, reset } = useCart(); const router = useRouter()
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false), [pay, setPay] = useState("cod")
  const items = cart?.items ?? []
  if (!items.length) return <Container className="py-16"><EmptyState icon={ShoppingBag} action={<Button href="/store">Parcourir les produits</Button>}>Votre commande est vide.</EmptyState></Container>

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k) || "").trim()
    const phone = g("phone").replace(/\D/g, "")
    if (phone.length < 9) return setErr("Téléphone invalide.")
    setBusy(true)
    try {
      const [first, ...rest] = g("name").split(" ")
      await post(`/store/carts/${cart!.id}`, { email: g("email") || `${phone}@client.lx.sn`, shipping_address: { first_name: first, last_name: rest.join(" ") || "-", address_1: g("address"), city: g("city") || "Dakar", country_code: "sn", phone }, metadata: { note: g("note"), payment_pref: pay } })
      const { shipping_options } = await store(`/store/shipping-options?cart_id=${cart!.id}`)
      if (!shipping_options.length) throw new Error("Aucune option de livraison disponible.")
      await post(`/store/carts/${cart!.id}/shipping-methods`, { option_id: shipping_options[0].id })
      const { payment_collection } = await post("/store/payment-collections", { cart_id: cart!.id })
      await post(`/store/payment-collections/${payment_collection.id}/payment-sessions`, { provider_id: "pp_system_default" })
      const r = await post(`/store/carts/${cart!.id}/complete`, {})
      if (r.type !== "order") throw new Error(r.error?.message || "La commande n'a pas pu être validée (stock insuffisant ?).")
      reset(); router.push(`/order/${r.order.display_id}?phone=${phone}`)
    } catch (e: any) { setErr(e.message); setBusy(false) }
  }
  return (<><PageHeader title="Valider ma commande" />
    <Container className="py-8">{err && <Banner tone="danger" className="mb-6">{err}</Banner>}
      <div className="grid gap-8 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-4 lg:col-span-3">
          <h2 className="text-lg font-bold">Coordonnées de livraison</h2>
          <Field label="Nom complet">{(id) => <Input id={id} name="name" required />}</Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone / WhatsApp">{(id) => <Input id={id} name="phone" placeholder="77 000 00 00" required />}</Field>
            <Field label="Email (optionnel)">{(id) => <Input id={id} type="email" name="email" />}</Field></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Adresse (quartier, repère)" className="sm:col-span-2">{(id) => <Input id={id} name="address" required />}</Field>
            <Field label="Ville">{(id) => <Input id={id} name="city" defaultValue="Dakar" />}</Field></div>
          <Field label="Précisions pour le livreur">{(id) => <Textarea id={id} name="note" rows={3} />}</Field>
          <h2 className="pt-2 text-lg font-bold">Paiement</h2>
          <div className="grid gap-2" role="radiogroup">{PAY.map(([v, l]) => (
            <label key={v} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition", pay === v ? "border-brand-600 bg-brand-50" : "border-line hover:border-slate-300")}>
              <input type="radio" name="payment" value={v} checked={pay === v} onChange={() => setPay(v)} className="accent-brand-600" />{l}</label>))}</div>
          <p className="text-xs text-slate-500">Mobile money / carte : enregistrés, l&apos;encaissement est confirmé par l&apos;équipe Lx.</p>
          <Button size="lg" full loading={busy} data-testid="confirm-order">{busy ? "Validation…" : "Confirmer la commande"}</Button></form>
        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
          <h2 className="text-lg font-bold">Récapitulatif</h2>
          <ul className="divide-y divide-line text-sm">{items.map((i) => <li key={i.id} className="flex justify-between gap-3 py-2"><span>{i.quantity} × {i.title}</span><span className="font-semibold">{fcfa(i.unit_price * i.quantity)}</span></li>)}</ul>
          <div className="flex justify-between border-t border-line pt-3 font-bold"><span>Sous-total produits</span><span>{fcfa(cart!.subtotal)}</span></div>
          <Banner tone="info">Frais de livraison Lx ajoutés à la validation. Sans réponse de la boutique sous 30 minutes, Lx prend le relais.</Banner></aside>
      </div></Container></>)
}
