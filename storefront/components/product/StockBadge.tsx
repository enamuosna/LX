export default function StockBadge({ stock, shop }: { stock: number; shop?: string }) {
  return stock > 0
    ? <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500"><span className="size-1.5 rounded-full bg-brand-500" />En stock{shop ? `, ${shop}` : ""}</span>
    : <span className="inline-flex items-center gap-1.5 text-[13px] text-bissap"><span className="size-1.5 rounded-full bg-bissap" />Rupture de stock</span>
}
