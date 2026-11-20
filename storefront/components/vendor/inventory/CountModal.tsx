"use client"
import { useMemo, useState } from "react"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { cn } from "@/lib/cn"
import { vendorApi } from "@/lib/vendor"
import type { Item } from "./labels"

/** Comptage : on saisit ce qu'on a vraiment en rayon, seuls les écarts sont enregistrés (et journalisés). */
export default function CountModal({ items, onDone, onClose }: { items: Item[]; onDone: () => void; onClose: () => void }) {
  const toast = useToast(); const [vals, setVals] = useState<Record<string, string>>({}), [busy, setBusy] = useState(false)
  const diffs = useMemo(() => items.filter((i) => vals[i.id] !== undefined && vals[i.id] !== "" && Number(vals[i.id]) !== i.stocked), [items, vals])
  return (<Modal title="Faire un inventaire" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button loading={busy} disabled={!diffs.length} data-testid="save-count" onClick={async () => {
    setBusy(true)
    try { const r = await vendorApi("/inventory/count", { counts: diffs.map((i) => ({ product_id: i.id, counted: Number(vals[i.id]) })) }); toast(r.errors?.length ? r.errors[0] : `${r.applied} écart(s) enregistré(s).`, !!r.errors?.length); onDone(); onClose() } catch (e: any) { toast(e.message, true); setBusy(false) }
  }}>{diffs.length ? `Enregistrer ${diffs.length} écart${diffs.length > 1 ? "s" : ""}` : "Aucun écart"}</Button></>}>
    <p className="mb-4 text-sm text-slate-600">Comptez ce que vous avez en rayon et saisissez la quantité. Laissez vide les produits que vous ne comptez pas.</p>
    <ul className="divide-y divide-line">{items.map((i) => { const v = vals[i.id], d = v === undefined || v === "" ? null : Number(v) - i.stocked
      return (<li key={i.id} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{i.title}</p><p className="text-xs text-slate-500">Système : {i.stocked}{i.sku ? `, ${i.sku}` : ""}</p></div>
        {d !== null && d !== 0 && <span className={cn("text-sm font-bold", d > 0 ? "text-brand-600" : "text-bissap")}>{d > 0 ? "+" : ""}{d}</span>}
        <input aria-label={`Quantité comptée pour ${i.title}`} type="number" min={0} value={v ?? ""} onChange={(e) => setVals({ ...vals, [i.id]: e.target.value })} placeholder={String(i.stocked)} data-testid="count-input" className="w-24 rounded-xl border border-line px-3 py-2 text-right text-sm focus:border-brand-600 focus:outline-none" /></li>) })}</ul></Modal>)
}
