import { ImageIcon, Pencil } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Price from "@/components/ui/Price"
import { cn } from "@/lib/cn"
import { img } from "@/lib/medusa"
import { priceOf, stockOf } from "./ProductFormModal"

export default function VendorProductCard({ p, canEdit, onToggle, onEdit }: { p: any; canEdit: boolean; onToggle: () => void; onEdit: () => void }) {
  const s = stockOf(p), on = p.status === "published"
  return (<div data-testid="vendor-product" className={cn("flex flex-col overflow-hidden rounded-2xl border border-line bg-white", !on && "opacity-70")}>
    <div className="relative grid aspect-[4/3] place-items-center bg-surface">{p.thumbnail ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img(p.thumbnail)} alt="" className="size-full object-contain p-3" /> : <ImageIcon className="size-10 text-slate-300" />}
      <Badge tone={on ? "green" : "gray"} className="absolute left-3 top-3">{on ? "Publié" : "Masqué"}</Badge></div>
    <div className="flex-1 space-y-1.5 p-4"><h4 className="line-clamp-2 font-bold leading-snug">{p.title}</h4><Price amount={priceOf(p)} old={p.metadata?.old_price} className="text-lg" />
      <div><Badge tone={s === 0 ? "red" : s <= 3 ? "orange" : "green"}>{s === 0 ? "Rupture de stock" : s <= 3 ? `Stock faible : ${s}` : `${s} en stock`}</Badge></div></div>
    <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
      <button role="switch" aria-checked={on} disabled={!canEdit} onClick={onToggle} data-testid="toggle-product" className="flex items-center gap-2 text-xs font-semibold text-slate-600 disabled:opacity-50">
        <span className={cn("relative h-5 w-9 rounded-full transition", on ? "bg-brand-600" : "bg-slate-300")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} /></span>{on ? "En vitrine" : "Masqué"}</button>
      <Button variant="secondary" size="sm" disabled={!canEdit} onClick={onEdit} data-testid="edit-product"><Pencil className="size-3.5" />Modifier</Button></div>
  </div>)
}
