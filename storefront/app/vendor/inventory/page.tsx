"use client"
import { ArrowDownToLine, ArrowUpFromLine, Boxes, ClipboardCheck, Download, History, PackageX, Pencil, Search, TriangleAlert, Wallet } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { Input } from "@/components/ui/Field"
import Modal from "@/components/ui/Modal"
import Skeleton from "@/components/ui/Skeleton"
import StatCard, { CountUp } from "@/components/ui/StatCard"
import CountModal from "@/components/vendor/inventory/CountModal"
import { type Item, type Movement } from "@/components/vendor/inventory/labels"
import MovementList from "@/components/vendor/inventory/MovementList"
import StockAdjustModal from "@/components/vendor/inventory/StockAdjustModal"
import Shell, { useVendor } from "@/components/vendor/Shell"
import { cn } from "@/lib/cn"
import { fcfa, img } from "@/lib/medusa"
import { vendorApi, vendorDownload } from "@/lib/vendor"

type Totals = { products: number; units: number; reserved: number; value_cost: number; value_retail: number; low: number; out: number }
const FILTERS = [["all", "Tous"], ["low", "Stock faible"], ["out", "Rupture"]] as const

function Inner() {
  const { shop, toast } = useVendor(); const approved = shop.status === "approved"
  const [data, setData] = useState<{ items: Item[]; totals: Totals } | null>(null), [tab, setTab] = useState<"stock" | "moves">("stock"), [filter, setFilter] = useState<"all" | "low" | "out">("all"), [q, setQ] = useState("")
  const [moves, setMoves] = useState<Movement[] | null>(null), [adjust, setAdjust] = useState<{ item: Item; mode: "add" | "remove" | "set" } | null>(null), [counting, setCounting] = useState(false), [history, setHistory] = useState<{ item: Item; list: Movement[] | null } | null>(null)
  const load = useCallback(() => vendorApi("/inventory").then(setData).catch((e) => toast(e.message, true)), [toast])
  const loadMoves = useCallback(() => vendorApi("/inventory/movements?limit=150").then((d) => setMoves(d.movements)).catch(() => setMoves([])), [])
  useEffect(() => { load() }, [load]); useEffect(() => { if (tab === "moves") loadMoves() }, [tab, loadMoves])
  const refresh = () => { load(); if (tab === "moves") loadMoves() }
  const shown = useMemo(() => (data?.items ?? []).filter((i) => (filter === "all" || i.state === filter) && (i.title + (i.sku ?? "")).toLowerCase().includes(q.toLowerCase())), [data, filter, q])
  const t = data?.totals

  return (<div className="space-y-6">
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" disabled={!approved || !data?.items.length} onClick={() => setCounting(true)} data-testid="start-count"><ClipboardCheck className="size-4" />Faire un inventaire</Button>
      <Button variant="secondary" size="sm" data-testid="export-inventory" onClick={() => vendorDownload("/inventory/export", "inventaire-lx.csv").catch((e) => toast(e.message, true))}><Download className="size-4" />Exporter en CSV</Button></div>
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard icon={Wallet} tone="green" value={<span className="whitespace-nowrap text-base sm:text-lg"><CountUp value={t?.value_cost ?? 0} format={fcfa} /></span>} label="Stock au prix d'achat" />
      <StatCard icon={Boxes} tone="blue" value={<span className="whitespace-nowrap text-base sm:text-lg"><CountUp value={t?.value_retail ?? 0} format={fcfa} /></span>} label={`Valeur de vente, ${t?.units ?? 0} unité(s)`} />
      <StatCard icon={TriangleAlert} tone="orange" value={<CountUp value={t?.low ?? 0} />} label="Stock faible" highlight={(t?.low ?? 0) > 0} />
      <StatCard icon={PackageX} tone="yellow" value={<CountUp value={t?.out ?? 0} />} label="En rupture" highlight={(t?.out ?? 0) > 0} /></div>

    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-line">{([["stock", "Stock"], ["moves", "Mouvements"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} data-testid={`tab-${k}`} className={cn("rounded-full px-4 py-1.5 text-sm font-bold transition", tab === k ? "bg-ink text-white" : "text-slate-500 hover:text-ink")}>{l}</button>)}</div>
      {tab === "stock" && <>{FILTERS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} data-testid={`filter-${k}`} className={cn("rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition", filter === k ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-600")}>{l}</button>)}
        <div className="relative ml-auto min-w-48 max-w-xs flex-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Produit ou SKU" aria-label="Rechercher dans l'inventaire" value={q} onChange={(e) => setQ(e.target.value)} /></div></>}</div>

    {tab === "stock" ? (!data ? <Skeleton className="h-72" /> : !shown.length ? <EmptyState icon={Boxes}>{data.items.length ? "Aucun produit dans cette sélection." : "Ajoutez des produits pour suivre votre stock."}</EmptyState> :
      <><ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:hidden" data-testid="inventory-cards">{shown.map((i) => (<li key={i.id} className="rounded-3xl border border-line bg-white p-4"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={i.thumbnail ? img(i.thumbnail) : "/img/product01.png"} alt="" className="size-14 shrink-0 rounded-xl bg-surface object-contain p-1" /><div className="min-w-0 flex-1"><p className="font-bold leading-snug">{i.title}</p><p className="truncate text-xs text-slate-500">{[i.sku, i.category].filter(Boolean).join(", ") || "Sans SKU"}</p></div><Badge tone={i.state === "out" ? "red" : i.state === "low" ? "orange" : "green"}>{i.state === "out" ? "Rupture" : i.state === "low" ? `${i.available}, faible` : i.available}</Badge></div>
      <dl className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-3 text-center text-xs text-slate-500"><div><dt>Physique</dt><dd className="font-display text-lg font-bold text-ink">{i.stocked}</dd></div><div><dt>Réservé</dt><dd className="font-display text-lg font-bold text-ink">{i.reserved}</dd></div><div><dt>Seuil</dt><dd className="font-display text-lg font-bold text-ink">{i.threshold}</dd></div></dl>
      <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" className="min-w-24 flex-1" disabled={!approved} onClick={() => setAdjust({ item: i, mode: "add" })}><ArrowDownToLine className="size-3.5" />Entrée</Button><Button size="sm" variant="secondary" className="min-w-24 flex-1" disabled={!approved || i.stocked === 0} onClick={() => setAdjust({ item: i, mode: "remove" })}><ArrowUpFromLine className="size-3.5" />Sortie</Button>
        <button disabled={!approved} onClick={() => setAdjust({ item: i, mode: "set" })} aria-label={`Corriger le stock de ${i.title}`} className="grid size-10 place-items-center rounded-full border border-line text-slate-500 disabled:opacity-40"><Pencil className="size-4" /></button>
        <button onClick={() => { setHistory({ item: i, list: null }); vendorApi(`/inventory/movements?product_id=${i.id}`).then((d) => setHistory({ item: i, list: d.movements })).catch(() => setHistory({ item: i, list: [] })) }} aria-label={`Historique de ${i.title}`} className="grid size-10 place-items-center rounded-full border border-line text-slate-500"><History className="size-4" /></button></div></li>))}</ul>
    <div className="hidden overflow-x-auto rounded-3xl border border-line bg-white md:block"><table className="w-full min-w-[860px] text-sm" data-testid="inventory-table">
        <thead className="border-b border-line bg-surface text-left text-xs text-slate-500"><tr><th className="px-5 py-3 font-semibold">Produit</th><th className="px-3 py-3 font-semibold">Disponible</th><th className="px-3 py-3 font-semibold">Réservé</th><th className="px-3 py-3 font-semibold">Physique</th><th className="px-3 py-3 font-semibold">Seuil</th><th className="px-3 py-3 text-right font-semibold">Valeur d&apos;achat</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead>
        <tbody className="divide-y divide-line">{shown.map((i) => (<tr key={i.id} data-testid="inventory-row" data-state={i.state} className="transition hover:bg-surface/60">
          <td className="px-5 py-3"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={i.thumbnail ? img(i.thumbnail) : "/img/product01.png"} alt="" className="size-11 rounded-xl bg-surface object-contain p-1" /><div className="min-w-0"><p className="max-w-[220px] truncate font-bold">{i.title}</p><p className="text-xs text-slate-500">{[i.sku, i.category].filter(Boolean).join(", ") || "Sans SKU"}</p></div></div></td>
          <td className="whitespace-nowrap px-3 py-3"><Badge tone={i.state === "out" ? "red" : i.state === "low" ? "orange" : "green"}>{i.state === "out" ? "Rupture" : i.available}{i.state === "low" ? ", faible" : ""}</Badge></td>
          <td className="px-3 py-3 text-slate-600">{i.reserved}</td><td className="px-3 py-3 font-semibold">{i.stocked}</td><td className="px-3 py-3 text-slate-500">{i.threshold}</td>
          <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">{i.cost ? fcfa(i.value_cost) : <span className="font-normal text-slate-400">À renseigner</span>}</td>
          <td className="px-5 py-3"><div className="flex justify-end gap-1.5">
            <Button size="sm" variant="secondary" disabled={!approved} onClick={() => setAdjust({ item: i, mode: "add" })} data-testid="stock-in" aria-label={`Entrée de stock pour ${i.title}`}><ArrowDownToLine className="size-3.5" />Entrée</Button>
            <Button size="sm" variant="secondary" disabled={!approved || i.stocked === 0} onClick={() => setAdjust({ item: i, mode: "remove" })} data-testid="stock-out" aria-label={`Sortie de stock pour ${i.title}`}><ArrowUpFromLine className="size-3.5" />Sortie</Button>
            <button disabled={!approved} onClick={() => setAdjust({ item: i, mode: "set" })} aria-label={`Corriger le stock de ${i.title}`} title="Corriger" className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-surface hover:text-ink disabled:opacity-40"><Pencil className="size-4" /></button>
            <button onClick={() => { setHistory({ item: i, list: null }); vendorApi(`/inventory/movements?product_id=${i.id}`).then((d) => setHistory({ item: i, list: d.movements })).catch(() => setHistory({ item: i, list: [] })) }} aria-label={`Historique de ${i.title}`} title="Historique" data-testid="history" className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-surface hover:text-ink"><History className="size-4" /></button></div></td></tr>))}</tbody></table></div></>)
    : !moves ? <Skeleton className="h-72" /> : !moves.length ? <EmptyState icon={History}>Aucun mouvement pour le moment.</EmptyState> : <div className="rounded-3xl border border-line bg-white px-5"><MovementList movements={moves} showProduct /></div>}

    <p className="text-xs text-slate-400">Disponible = physique moins réservé par des commandes en cours. Le stock physique baisse à la livraison. Un produit refusé ou annulé est remis en vente.</p>
    {adjust && <StockAdjustModal item={adjust.item} mode={adjust.mode} onDone={refresh} onClose={() => setAdjust(null)} />}
    {counting && data && <CountModal items={data.items} onDone={refresh} onClose={() => setCounting(false)} />}
    {history && <Modal title={`Historique : ${history.item.title}`} onClose={() => setHistory(null)}>{!history.list ? <Skeleton className="h-32" /> : history.list.length ? <MovementList movements={history.list} /> : <p className="text-slate-500">Aucun mouvement.</p>}</Modal>}
  </div>)
}
export default function VendorInventory() { return <Shell title="Inventaire" subtitle="Votre stock en temps réel, les entrées, les sorties et les comptages."><Inner /></Shell> }
