import { CheckCircle2 } from "lucide-react"
export default function StockBadge({ stock, shop }: { stock: number; shop?: string }) {
  return stock > 0
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"><CheckCircle2 className="size-3.5" />En stock{shop ? ` · ${shop}` : ""}</span>
    : <span className="text-xs font-semibold text-red-700">Rupture de stock</span>
}
