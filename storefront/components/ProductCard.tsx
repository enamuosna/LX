"use client"
import Link from "next/link"
import { useState } from "react"
import { useCart } from "@/lib/cart"
import { fcfa, price, stock, type Product } from "@/lib/medusa"

export default function ProductCard({ p }: { p: Product }) {
  const { add, busy } = useCart(); const [done, setDone] = useState(false)
  const s = stock(p), old = p.metadata?.old_price, v = p.variants?.[0]
  return (<div className="col-md-3 col-xs-6"><div className="product">
    <div className="product-img"><img src={p.thumbnail || "/img/product01.png"} alt="" />{s > 0 && <div className="product-label"><span className="sale">Dispo</span></div>}</div>
    <div className="product-body"><p className="product-category">{p.categories?.[0]?.name}</p>
      <h3 className="product-name"><Link href={`/products/${p.handle}`}>{p.title}</Link></h3>
      <h4 className="product-price">{fcfa(price(p))} {old ? <del className="product-old-price">{fcfa(old)}</del> : null}</h4>
      <p style={{ fontSize: 12, margin: 0, color: s > 0 ? "#0B7A43" : "#b00020" }}>{s > 0 ? <><i className="fa fa-check-circle" /> En stock{p.metadata?.shop_name ? ` · ${p.metadata.shop_name}` : ""}</> : "Rupture de stock"}</p></div>
    <div className="add-to-cart">{s > 0 && v && <button className="add-to-cart-btn" disabled={busy} onClick={async () => { await add(v.id); setDone(true); setTimeout(() => setDone(false), 1500) }}><i className="fa fa-shopping-cart" /> {done ? "Ajouté ✓" : "Commander"}</button>}</div>
  </div></div>)
}
