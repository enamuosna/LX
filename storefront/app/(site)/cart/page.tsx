"use client"
import Link from "next/link"
import { useCart } from "@/lib/cart"
import { fcfa } from "@/lib/medusa"
export default function CartPage() {
  const { cart, setQty, remove, busy } = useCart(); const items = cart?.items ?? []
  return (<><div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>Ma commande</h2></div></div>
    <div className="section"><div className="container">
      {!items.length ? <p>Votre commande est vide. <Link href="/store">Parcourir les produits</Link></p> : <>
        <table className="tbl"><thead><tr><th>Produit</th><th>Prix</th><th>Qté</th><th>Total</th><th /></tr></thead><tbody>
          {items.map((i) => <tr key={i.id}><td>{i.title}</td><td>{fcfa(i.unit_price)}</td>
            <td><input type="number" min={1} defaultValue={i.quantity} style={{ width: 70 }} disabled={busy} onBlur={(e) => Number(e.target.value) !== i.quantity && setQty(i.id, Number(e.target.value))} /></td>
            <td>{fcfa(i.unit_price * i.quantity)}</td><td><button onClick={() => remove(i.id)} disabled={busy} title="Retirer">✕</button></td></tr>)}
          <tr><th colSpan={3} style={{ textAlign: "right" }}>Sous-total produits</th><th colSpan={2}>{fcfa(cart!.subtotal)}</th></tr></tbody></table>
        <p>Les frais de livraison Lx sont ajoutés à l&apos;étape suivante.</p>
        <Link className="primary-btn" href="/checkout" style={{ display: "inline-block", lineHeight: "40px", padding: "0 30px", borderRadius: 40 }}>Valider ma commande</Link></>}
    </div></div></>)
}
