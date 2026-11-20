"use client"
import { Check, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Price from "@/components/ui/Price"
import StockBadge from "./StockBadge"
import FavoriteButton from "./FavoriteButton"
import { Stars } from "@/components/ui/Stars"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/cn"
import { img, price, stock, type Product } from "@/lib/medusa"

export default function ProductCard({ p, rating }: { p: Product; rating?: { avg: number; count: number } }) {
  const { add, busy } = useCart(); const [done, setDone] = useState(false)
  const s = stock(p), v = p.variants?.[0], canBuy = s > 0 && !!v
  return (<article data-testid="product-card" className="group">
    <div className="relative">
      <Link href={`/products/${p.handle}`} className="block aspect-square overflow-hidden rounded-[1.75rem] bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(p.thumbnail)} alt={p.title} loading="lazy" className={cn("size-full object-contain p-6 transition duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.06] group-hover:-rotate-2", s === 0 && "opacity-40 grayscale")} /></Link>
      <FavoriteButton id={p.id} className="absolute right-3 top-3" />
      {canBuy && <button data-testid="add-card" aria-label={`Commander ${p.title}`} disabled={busy} onClick={async () => { await add(v!.id); setDone(true); setTimeout(() => setDone(false), 1600) }}
        className={cn("absolute bottom-3 right-3 grid size-11 place-items-center rounded-full shadow-lg transition duration-300 active:scale-90", done ? "scale-110 bg-accent-500 text-ink" : "bg-ink text-white hover:bg-brand-600 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100")}>
        {done ? <Check className="size-5 animate-pop-in" strokeWidth={3} /> : <Plus className="size-5" strokeWidth={2.5} />}</button>}</div>
    <div className="px-1 pt-3.5">
      <h3 className="line-clamp-2 text-[17px] font-bold leading-snug"><Link href={`/products/${p.handle}`} className="hover:text-brand-600">{p.title}</Link></h3>
      <div className="mt-1 flex items-baseline justify-between gap-2"><Price amount={price(p)} old={p.metadata?.old_price} className="text-lg" /></div>
      {rating && rating.count > 0 && <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Stars value={rating.avg} size="size-3.5" />{rating.avg} ({rating.count})</div>}
      <div className="mt-1"><StockBadge stock={s} shop={p.metadata?.shop_code} /></div></div>
  </article>)
}
