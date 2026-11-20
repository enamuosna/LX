export default function StockBadge({ stock, shop }: { stock: number; shop?: string }) {
  return stock > 0
    ? <span className="text-[13px] text-slate-500">En stock{shop ? `, boutique ${shop}` : ""}</span>
    : <span className="text-[13px] font-semibold text-bissap">Rupture de stock</span>
}
