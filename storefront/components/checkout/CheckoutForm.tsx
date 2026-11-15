"use client"
import { BadgeCheck, ShoppingBag, Tag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"
import Container from "@/components/ui/Container"
import EmptyState from "@/components/ui/EmptyState"
import { Field, Input, Textarea } from "@/components/ui/Field"
import PageHeader from "@/components/ui/PageHeader"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/cn"
import { customerHeaders, useCustomer } from "@/lib/customer"
import { fcfa, post, store } from "@/lib/medusa"

const PAY: [string, string][] = [["cod", "Paiement à la livraison"], ["wave", "Wave"], ["orange_money", "Orange Money"], ["card", "Carte bancaire"]]
type Option = { id: string; name: string; amount: number }

export default function CheckoutForm({ wave: WAVE, om: OM }: { wave: string; om: string }) {
  const { cart, reset, reload } = useCart(); const router = useRouter(); const { customer } = useCustomer()
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false), [pay, setPay] = useState("cod")
  const [options, setOptions] = useState<Option[]>([]), [zone, setZone] = useState(""), [code, setCode] = useState(""), [promoMsg, setPromoMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const items = cart?.items ?? [], addr = customer?.addresses?.[0]
  const cartId = cart?.id
  useEffect(() => { if (!cartId) return; store(`/store/shipping-options?cart_id=${cartId}`).then((d) => { setOptions(d.shipping_options); setZone((z) => z || d.shipping_options[0]?.id || "") }).catch(() => setErr("Impossible de charger les zones de livraison.")) }, [cartId])
  if (!items.length) return <Container className="py-16"><EmptyState icon={ShoppingBag} action={<Button href="/store">Parcourir les produits</Button>}>Votre commande est vide.</EmptyState></Container>

  const fee = options.find((o) => o.id === zone)?.amount ?? 0, discount = cart!.discount_total ?? 0, total = cart!.subtotal - discount + fee
  async function applyPromo() {
    if (!code.trim()) return; setPromoMsg(null)
    try { await post(`/store/carts/${cart!.id}/promotions`, { promo_codes: [code.trim()] }); await reload(); setPromoMsg({ ok: true, t: "Code appliqué." }) } catch (e: any) { setPromoMsg({ ok: false, t: "Ce code n'est pas valable pour votre commande." }) }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k) || "").trim()
    const phone = g("phone").replace(/\D/g, "")
    if (phone.length < 9) return setErr("Téléphone invalide.")
    if (["wave", "orange_money"].includes(pay) && g("payment_ref").length < 4) return setErr("Saisissez la référence de la transaction reçue par SMS.")
    setBusy(true)
    try {
      const [first, ...rest] = g("name").split(" ")
      await post(`/store/carts/${cart!.id}`, { email: customer?.email || g("email") || `${phone}@client.lx.sn`, shipping_address: { first_name: first, last_name: rest.join(" ") || "-", address_1: g("address"), city: g("city") || "Dakar", country_code: "sn", phone }, metadata: { note: g("note"), payment_pref: pay, payment_ref: g("payment_ref") || null } })
      if (customer) await store(`/store/carts/${cart!.id}/customer`, { method: "POST", body: "{}", headers: customerHeaders() }).catch(() => {})
      if (!zone) throw new Error("Choisissez une zone de livraison.")
      await post(`/store/carts/${cart!.id}/shipping-methods`, { option_id: zone })
      const { payment_collection } = await post("/store/payment-collections", { cart_id: cart!.id })
      await post(`/store/payment-collections/${payment_collection.id}/payment-sessions`, { provider_id: "pp_system_default" })
      const r = await post(`/store/carts/${cart!.id}/complete`, {})
      if (r.type !== "order") throw new Error(r.error?.message || "La commande n'a pas pu être validée (stock insuffisant ?).")
      reset(); router.push(`/order/${r.order.display_id}?phone=${phone}`)
    } catch (e: any) { setErr(e.message); setBusy(false) }
  }
  return (<><PageHeader title="Valider ma commande" />
    <Container className="py-8">{err && <Banner tone="danger" className="mb-6">{err}</Banner>}
      {!customer && <Banner tone="info" className="mb-6"><Link href="/account" className="font-bold underline">Connectez-vous</Link> pour retrouver vos adresses et suivre vos commandes depuis votre compte.</Banner>}
      <div className="grid gap-8 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-4 lg:col-span-3">
          <h2 className="text-xl font-bold">Coordonnées de livraison</h2>
          <Field label="Nom complet">{(id) => <Input id={id} name="name" key={addr?.id} defaultValue={addr ? `${addr.first_name ?? ""} ${addr.last_name !== "-" ? addr.last_name ?? "" : ""}`.trim() : `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim()} required />}</Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone / WhatsApp">{(id) => <Input id={id} name="phone" key={addr?.id} defaultValue={addr?.phone || customer?.phone} placeholder="77 000 00 00" required />}</Field>
            {!customer && <Field label="Email (optionnel)">{(id) => <Input id={id} type="email" name="email" />}</Field>}</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Adresse (quartier, repère)" className="sm:col-span-2">{(id) => <Input id={id} name="address" key={addr?.id} defaultValue={addr?.address_1} required />}</Field>
            <Field label="Ville">{(id) => <Input id={id} name="city" key={addr?.id} defaultValue={addr?.city || "Dakar"} />}</Field></div>
          <Field label="Précisions pour le livreur">{(id) => <Textarea id={id} name="note" rows={3} />}</Field>
          <h2 className="pt-2 text-xl font-bold">Zone de livraison</h2>
          <div className="grid gap-2" role="radiogroup" aria-label="Zone de livraison">{options.map((o) => (
            <label key={o.id} data-testid="zone" className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition", zone === o.id ? "border-brand-600 bg-brand-50" : "border-line hover:border-slate-300")}>
              <input type="radio" name="zone" value={o.id} checked={zone === o.id} onChange={() => setZone(o.id)} className="accent-brand-600" /><span className="flex-1 font-semibold">{o.name}</span><b>{fcfa(o.amount)}</b></label>))}</div>
          <h2 className="pt-2 text-xl font-bold">Paiement</h2>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Mode de paiement">{PAY.map(([v, l]) => (
            <label key={v} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition", pay === v ? "border-brand-600 bg-brand-50" : "border-line hover:border-slate-300")}>
              <input type="radio" name="payment" value={v} checked={pay === v} onChange={() => setPay(v)} className="accent-brand-600" />{l}</label>))}</div>
          {["wave", "orange_money"].includes(pay) && <div className="animate-pop-in space-y-3 rounded-2xl bg-accent-500/15 p-4 text-sm"><p>Envoyez le total (<b>{fcfa(total)}</b>) par {pay === "wave" ? "Wave" : "Orange Money"} au <b className="font-display text-lg">{pay === "wave" ? WAVE : OM}</b>, puis saisissez la référence reçue par SMS. Lx confirme votre paiement avant la livraison.</p>
            <Field label="Référence de la transaction">{(id) => <Input id={id} name="payment_ref" placeholder="ex : MP241115.1234.A56789" required />}</Field></div>}
          {pay === "card" && <p className="text-xs text-slate-500">Le paiement par carte est enregistré, un conseiller Lx vous envoie le lien de paiement.</p>}
          <Button size="lg" full loading={busy} data-testid="confirm-order">{busy ? "Validation…" : `Confirmer et payer ${fcfa(total)}`}</Button></form>
        <aside className="h-fit space-y-4 rounded-[2rem] bg-surface p-7 lg:col-span-2">
          <h2 className="text-xl font-bold">Récapitulatif</h2>
          <ul className="divide-y divide-line text-sm">{items.map((i) => <li key={i.id} className="flex justify-between gap-3 py-2.5"><span>{i.quantity} × {i.title}</span><span className="font-semibold">{fcfa(i.unit_price * i.quantity)}</span></li>)}</ul>
          <div className="flex gap-2"><div className="relative flex-1"><Tag className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code promo" aria-label="Code promo" className="pl-10" data-testid="promo-input" /></div><Button type="button" variant="secondary" onClick={applyPromo} data-testid="promo-apply">Appliquer</Button></div>
          {promoMsg && <p className={cn("flex items-center gap-1.5 text-sm font-semibold", promoMsg.ok ? "text-brand-600" : "text-bissap")}>{promoMsg.ok && <BadgeCheck className="size-4" />}{promoMsg.t}</p>}
          <dl className="space-y-2 border-t border-line pt-4 text-sm"><div className="flex justify-between"><dt>Produits</dt><dd>{fcfa(cart!.subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between font-semibold text-brand-600" data-testid="discount"><dt>Réduction</dt><dd>-{fcfa(discount)}</dd></div>}
            <div className="flex justify-between"><dt>Livraison Lx</dt><dd>{fcfa(fee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 font-display text-xl font-bold"><dt>Total</dt><dd data-testid="total">{fcfa(total)}</dd></div></dl>
          <p className="text-xs text-slate-500">Sans réponse de la boutique sous 30 minutes, Lx prend le relais.</p></aside>
      </div></Container></>)
}
