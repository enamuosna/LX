"use client"
import { Check, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Price from "@/components/ui/Price"
import StockBadge from "./StockBadge"
import { useCart } from "@/lib/cart"
import { img, price, stock, type Product } from "@/lib/medusa"

export default function ProductCard({ p }: { p: Product }) {
  const { add, busy } = useCart(); const [done, setDone] = useState(false)
  const s = stock(p), v = p.variants?.[0]
  return (<article data-testid="product-card" className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
    <Link href={`/products/${p.handle}`} className="relative block aspect-square bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img(p.thumbnail)} alt={p.title} className="size-full object-contain p-4 transition group-hover:scale-105" loading="lazy" />
      {s > 0 && <Badge tone="solid" className="absolute left-3 top-3">Dispo</Badge>}</Link>
    <div className="flex flex-1 flex-col gap-1.5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{p.categories?.[0]?.name ?? " "}</p>
      <h3 className="line-clamp-2 min-h-10 font-bold leading-snug"><Link href={`/products/${p.handle}`} className="hover:text-brand-600">{p.title}</Link></h3>
      <Price amount={price(p)} old={p.metadata?.old_price} className="text-lg" />
      <StockBadge stock={s} shop={p.metadata?.shop_name} /></div>
    <div className="p-4 pt-0">{s > 0 && v ? <Button full size="sm" disabled={busy} data-testid="add-card" onClick={async () => { await add(v.id); setDone(true); setTimeout(() => setDone(false), 1500) }}>
      {done ? <><Check className="size-4" />Ajouté</> : <><ShoppingCart className="size-4" />Commander</>}</Button> : <Button full size="sm" variant="secondary" disabled>Indisponible</Button>}</div>
  </article>)
}
