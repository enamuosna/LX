"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCart } from "@/lib/cart"
import { fcfa, post, store } from "@/lib/medusa"

export default function Checkout() {
  const { cart, reset } = useCart(); const router = useRouter()
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false)
  const items = cart?.items ?? []
  if (!items.length) return <div className="section"><div className="container"><p>Votre commande est vide. <Link href="/store">Parcourir les produits</Link></p></div></div>

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k) || "").trim()
    const phone = g("phone").replace(/\D/g, "")
    if (phone.length < 9) return setErr("Téléphone invalide.")
    setBusy(true)
    try {
      const [first, ...rest] = g("name").split(" ")
      await post(`/store/carts/${cart!.id}`, { email: g("email") || `${phone}@client.lx.sn`, shipping_address: { first_name: first, last_name: rest.join(" ") || "-", address_1: g("address"), city: g("city") || "Dakar", country_code: "sn", phone }, metadata: { note: g("note"), payment_pref: g("payment") } })
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
  return (<><div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>Valider ma commande</h2></div></div>
    <div className="section"><div className="container">{err && <div className="alert alert-danger">{err}</div>}<div className="row">
      <div className="col-md-7"><div className="section-title"><h3 className="title">Coordonnées de livraison</h3></div>
        <form onSubmit={submit}>
          <div className="form-group"><input className="input" name="name" placeholder="Nom complet" required /></div>
          <div className="form-group"><input className="input" name="phone" placeholder="Téléphone / WhatsApp (ex : 77 000 00 00)" required /></div>
          <div className="form-group"><input className="input" type="email" name="email" placeholder="Email (optionnel)" /></div>
          <div className="form-group"><input className="input" name="address" placeholder="Adresse (quartier, repère)" required /></div>
          <div className="form-group"><input className="input" name="city" defaultValue="Dakar" placeholder="Ville" /></div>
          <div className="form-group"><textarea className="input" name="note" rows={3} placeholder="Précisions pour le livreur" /></div>
          <div className="section-title"><h3 className="title">Paiement</h3></div>
          {[["cod", "Paiement à la livraison"], ["mobile_money", "Mobile money (Wave, Orange Money)"], ["card", "Carte bancaire"]].map(([v, l], i) => <div key={v} className="input-radio"><label><input type="radio" name="payment" value={v} defaultChecked={i === 0} /> {l}</label></div>)}
          <p style={{ fontSize: 12 }}>Mobile money / carte : enregistrés, l&apos;encaissement est confirmé par l&apos;équipe Lx.</p>
          <button className="primary-btn" disabled={busy} style={{ marginTop: 15, borderRadius: 40, width: "100%" }}>{busy ? "Validation…" : "Confirmer la commande"}</button></form></div>
      <div className="col-md-5"><div className="section-title"><h3 className="title">Récapitulatif</h3></div><table className="tbl"><tbody>
        {items.map((i) => <tr key={i.id}><td>{i.quantity} × {i.title}</td><td style={{ textAlign: "right" }}>{fcfa(i.unit_price * i.quantity)}</td></tr>)}
        <tr><th>Sous-total produits</th><th style={{ textAlign: "right" }}>{fcfa(cart!.subtotal)}</th></tr></tbody></table>
        <div className="lx-notice">Frais de livraison Lx ajoutés à la validation. Sans réponse de la boutique sous 30 minutes, Lx prend le relais.</div></div>
    </div></div></div></>)
}
