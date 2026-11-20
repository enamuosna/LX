"use client"
import { Banknote, CalendarDays, CheckCircle2, CreditCard, Minus, Plus, Printer, ReceiptText, ScanBarcode, Search, ShoppingBasket, Smartphone, Trash2, Undo2, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { Input } from "@/components/ui/Field"
import Modal from "@/components/ui/Modal"
import Skeleton from "@/components/ui/Skeleton"
import StatCard from "@/components/ui/StatCard"
import { METHOD, printClosing, printReceipt } from "@/components/vendor/pos/receipt"
import Shell, { useVendor } from "@/components/vendor/Shell"
import { cn } from "@/lib/cn"
import { fcfa, img } from "@/lib/medusa"
import { vendorApi } from "@/lib/vendor"

type Item = { id: string; title: string; thumbnail: string | null; sku: string | null; category: string | null; price: number; available: number }
const PAY = [{ k: "cash", icon: Banknote }, { k: "wave", icon: Smartphone }, { k: "om", icon: Smartphone }, { k: "card", icon: CreditCard }] as const
const today = () => new Date().toISOString().slice(0, 10)

function Register() {
  const { shop, toast } = useVendor(); const approved = shop.status === "approved"
  const [items, setItems] = useState<Item[] | null>(null), [q, setQ] = useState(""), [cat, setCat] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({}), [discount, setDiscount] = useState(""), [method, setMethod] = useState<string>("cash"), [received, setReceived] = useState("")
  const [name, setName] = useState(""), [phone, setPhone] = useState(""), [busy, setBusy] = useState(false), [done, setDone] = useState<any>(null), [cartOpen, setCartOpen] = useState(false)
  const load = useCallback(() => vendorApi("/pos").then((d) => setItems(d.items)).catch((e) => toast(e.message, true)), [toast])
  useEffect(() => { load() }, [load])
  const byId = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items])
  const cats = useMemo(() => [...new Set((items ?? []).map((i) => i.category).filter(Boolean))] as string[], [items])
  const shown = (items ?? []).filter((i) => (!cat || i.category === cat) && (i.title + (i.sku ?? "")).toLowerCase().includes(q.toLowerCase()))
  const lines = Object.entries(cart).map(([id, qty]) => ({ it: byId.get(id)!, qty })).filter((l) => l.it)
  const subtotal = lines.reduce((s, l) => s + l.qty * l.it.price, 0), disc = Math.min(subtotal, Math.max(0, Math.round(Number(discount) || 0))), total = subtotal - disc
  const rec = received === "" ? total : Number(received), change = method === "cash" ? Math.max(0, rec - total) : 0
  const add = (it: Item) => setCart((c) => { const n = (c[it.id] ?? 0) + 1; if (n > it.available) { toast(`Stock disponible : ${it.available}`, true); return c } return { ...c, [it.id]: n } })
  const set = (id: string, n: number) => setCart((c) => { const it = byId.get(id)!; if (n <= 0) { const { [id]: _, ...rest } = c; return rest } if (n > it.available) { toast(`Stock disponible : ${it.available}`, true); return c } return { ...c, [id]: n } })
  const scan = (v: string) => { const it = (items ?? []).find((i) => i.sku && i.sku.toLowerCase() === v.trim().toLowerCase()); if (it) { add(it); setQ("") } }
  const reset = () => { setCart({}); setDiscount(""); setReceived(""); setName(""); setPhone(""); setMethod("cash") }
  const pay = async () => {
    setBusy(true)
    try {
      const r = await vendorApi("/pos/sales", { items: lines.map((l) => ({ product_id: l.it.id, quantity: l.qty })), discount: disc, payment_method: method, amount_received: method === "cash" ? rec : undefined, customer_name: name || undefined, customer_phone: phone || undefined })
      setDone(r.sale); setCartOpen(false); reset(); load()
    } catch (e: any) { toast(e.message, true); load() } finally { setBusy(false) }
  }
  const quick = [...new Set([total, ...[1000, 5000, 10000].map((u) => Math.ceil(total / u) * u)])].filter((n) => n > 0).slice(0, 4)

  return (<div className="grid gap-6 lg:grid-cols-[1fr_400px]">
    <section className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Rechercher ou scanner un code SKU" aria-label="Rechercher un produit" value={q} data-testid="pos-search" onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") scan(q) }} /></div>
        <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex"><ScanBarcode className="size-4" />Entrée ajoute le SKU exact</span></div>
      {cats.length > 0 && <div className="flex flex-wrap gap-2">{["", ...cats].map((c) => <button key={c || "all"} onClick={() => setCat(c)} className={cn("rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition", cat === c ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-600")}>{c || "Tout"}</button>)}</div>}
      {!items ? <Skeleton className="h-64" /> : !shown.length ? <EmptyState icon={ShoppingBasket}>{items.length ? "Aucun produit ne correspond." : "Ajoutez des produits pour pouvoir les vendre en caisse."}</EmptyState> :
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{shown.map((i) => { const inCart = cart[i.id] ?? 0, out = i.available <= 0
          return (<button key={i.id} disabled={out || !approved} onClick={() => add(i)} data-testid="pos-item" aria-label={`Ajouter ${i.title}`} className={cn("relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition active:scale-[0.98] enabled:hover:border-brand-600 enabled:hover:shadow-md disabled:opacity-50", inCart ? "border-brand-600 ring-2 ring-brand-600/20" : "border-line")}>
            {inCart > 0 && <span className="absolute right-2 top-2 z-10 grid min-w-6 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-extrabold text-white">{inCart}</span>}
            <div className="grid aspect-[4/3] place-items-center bg-surface">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={i.thumbnail ? img(i.thumbnail) : "/img/product01.png"} alt="" className="size-full object-contain p-3" /></div>
            <div className="space-y-0.5 p-3"><p className="line-clamp-2 text-sm font-bold leading-snug">{i.title}</p><p className="font-display font-bold text-brand-600">{fcfa(i.price)}</p><p className={cn("text-xs", out ? "font-semibold text-red-600" : i.available <= 3 ? "font-semibold text-amber-700" : "text-slate-400")}>{out ? "Rupture" : `${i.available} en stock`}</p></div></button>) })}</div>}
    </section>

    <div className="lg:hidden" style={{ height: lines.length ? "4.5rem" : 0 }} />
    {lines.length > 0 && !cartOpen && <button onClick={() => setCartOpen(true)} data-testid="pos-open-cart" className="fixed inset-x-3 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-40 flex items-center justify-between rounded-full bg-brand-600 px-5 py-3.5 font-bold text-white shadow-xl active:scale-[0.98] lg:hidden"><span className="flex items-center gap-2"><ShoppingBasket className="size-5" />Panier, {lines.reduce((n, l) => n + l.qty, 0)} article(s)</span><span>{fcfa(total)}</span></button>}
    <aside className={cn(cartOpen ? "fixed inset-0 z-50 flex items-end bg-night/60 lg:static lg:block lg:bg-transparent" : "hidden lg:block", "lg:sticky lg:top-6 lg:self-start")} onMouseDown={(e) => e.target === e.currentTarget && setCartOpen(false)}>
      <div className="pb-safe max-h-[92dvh] w-full space-y-4 overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-white p-5 lg:max-h-none lg:rounded-3xl lg:pb-5" data-testid="pos-cart">
        <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">Panier</h3><div className="flex items-center gap-3">{lines.length > 0 && <button onClick={reset} className="text-xs font-semibold text-slate-400 hover:text-red-600" data-testid="pos-clear">Vider</button>}<button onClick={() => setCartOpen(false)} aria-label="Fermer le panier" className="grid size-10 place-items-center rounded-full bg-surface lg:hidden"><X className="size-4" /></button></div></div>
        {!lines.length ? <p className="rounded-2xl bg-surface p-6 text-center text-sm text-slate-500">Touchez un produit pour l&apos;ajouter au panier.</p> :
          <ul className="max-h-64 divide-y divide-line overflow-y-auto">{lines.map(({ it, qty }) => (<li key={it.id} data-testid="pos-line" className="flex items-center gap-3 py-2.5"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{it.title}</p><p className="text-xs text-slate-500">{fcfa(it.price)}</p></div>
            <div className="flex items-center gap-1"><button aria-label="Retirer une unité" onClick={() => set(it.id, qty - 1)} className="grid size-9 place-items-center rounded-full border border-line hover:border-brand-600"><Minus className="size-3.5" /></button><b className="w-6 text-center text-sm" data-testid="pos-qty">{qty}</b><button aria-label="Ajouter une unité" onClick={() => set(it.id, qty + 1)} className="grid size-9 place-items-center rounded-full border border-line hover:border-brand-600"><Plus className="size-3.5" /></button></div>
            <b className="w-24 whitespace-nowrap text-right text-sm">{fcfa(it.price * qty)}</b><button aria-label={`Retirer ${it.title}`} onClick={() => set(it.id, 0)} className="grid size-9 place-items-center text-slate-300 hover:text-red-600"><Trash2 className="size-4" /></button></li>))}</ul>}
        <label className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-600">Remise (FCFA)</span><Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className="!w-32 !py-2 text-right" data-testid="pos-discount" /></label>
        <div className="space-y-1 border-t border-line pt-3">{disc > 0 && <div className="flex justify-between text-sm text-slate-500"><span>Sous-total</span><span>{fcfa(subtotal)}</span></div>}<div className="flex items-end justify-between"><span className="font-semibold">Total à payer</span><b className="font-display text-3xl" data-testid="pos-total">{fcfa(total)}</b></div></div>
        <div className="grid grid-cols-2 gap-2">{PAY.map(({ k, icon: I }) => <button key={k} onClick={() => setMethod(k)} data-testid={`pay-${k}`} aria-pressed={method === k} className={cn("flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-bold transition", method === k ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-600")}><I className="size-4" />{METHOD[k]}</button>)}</div>
        {method === "cash" && total > 0 && <div className="space-y-2 rounded-2xl bg-surface p-3"><label className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-600">Montant reçu</span><Input type="number" min={0} value={received} placeholder={String(total)} onChange={(e) => setReceived(e.target.value)} className="!w-36 !py-2 text-right" data-testid="pos-received" /></label>
          <div className="flex flex-wrap gap-1.5">{quick.map((n) => <button key={n} onClick={() => setReceived(String(n))} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold hover:border-brand-600">{n === total ? "Compte exact" : fcfa(n)}</button>)}</div>
          <div className="flex justify-between text-sm"><span className="font-semibold text-slate-600">À rendre</span><b className={cn("font-display text-lg", rec < total ? "text-red-600" : "text-brand-600")} data-testid="pos-change">{rec < total ? "Insuffisant" : fcfa(change)}</b></div></div>}
        {method !== "cash" && total > 0 && <p className="rounded-2xl bg-surface p-3 text-xs text-slate-600">{method === "card" ? "Encaissez sur votre terminal de carte, puis validez." : `Vérifiez la réception du paiement ${METHOD[method]} sur votre téléphone, puis validez.`}</p>}
        <details className="text-sm"><summary className="cursor-pointer font-semibold text-slate-500">Client (facultatif)</summary><div className="mt-2 grid grid-cols-2 gap-2"><Input placeholder="Nom" aria-label="Nom du client" value={name} onChange={(e) => setName(e.target.value)} /><Input placeholder="Téléphone" aria-label="Téléphone du client" value={phone} onChange={(e) => setPhone(e.target.value)} /></div></details>
        <Button className="w-full" size="lg" loading={busy} disabled={!approved || !lines.length || (method === "cash" && rec < total)} onClick={pay} data-testid="pos-pay">Encaisser {total > 0 ? fcfa(total) : ""}</Button></div>
    </aside>

    {done && <Modal title="Vente enregistrée" onClose={() => setDone(null)} footer={<><Button variant="secondary" onClick={() => printReceipt(done, shop as any)} data-testid="pos-print"><Printer className="size-4" />Imprimer le ticket</Button><Button onClick={() => setDone(null)} data-testid="pos-new">Nouvelle vente</Button></>}>
      <div className="space-y-3 text-center" data-testid="pos-done"><CheckCircle2 className="mx-auto size-12 text-brand-600" /><p className="font-display text-3xl font-bold">{fcfa(done.total)}</p><p className="text-sm text-slate-500">Ticket n° {done.number}, {METHOD[done.payment_method]}</p>
        {done.payment_method === "cash" && <p className="rounded-2xl bg-brand-50 p-3 font-semibold text-brand-700">À rendre au client : <b data-testid="pos-done-change">{fcfa(done.change_given)}</b></p>}</div></Modal>}
  </div>)
}

function Sales() {
  const { shop, toast } = useVendor(); const [day, setDay] = useState(today()), [data, setData] = useState<any>(null)
  const load = useCallback(() => vendorApi(`/pos/sales?day=${day}`).then(setData).catch((e) => toast(e.message, true)), [day, toast])
  useEffect(() => { setData(null); load() }, [load])
  const void_ = async (s: any) => { if (!confirm(`Annuler le ticket n° ${s.number} ? Le stock sera remis en rayon.`)) return; try { await vendorApi(`/pos/sales/${s.id}`, {}); toast("Vente annulée, stock remis en rayon."); load() } catch (e: any) { toast(e.message, true) } }
  const s = data?.summary
  return (<div className="space-y-6">
    <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4 text-slate-400" /><input type="date" value={day} max={today()} onChange={(e) => e.target.value && setDay(e.target.value)} aria-label="Jour" className="rounded-xl border border-line bg-white px-3 py-2" data-testid="pos-day" /></label>
      <Button variant="secondary" size="sm" disabled={!s} onClick={() => printClosing(day, s, shop)} data-testid="print-closing"><Printer className="size-4" />Imprimer la clôture de caisse</Button></div>
    {!data ? <Skeleton className="h-64" /> : <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4"><StatCard icon={Banknote} tone="green" value={<span className="whitespace-nowrap text-lg" data-testid="sum-total">{fcfa(s.total)}</span>} label="Total encaissé" /><StatCard icon={ReceiptText} tone="blue" value={<span data-testid="sum-count">{s.count}</span>} label="Ventes" />
        <StatCard icon={ShoppingBasket} tone="yellow" value={s.units} label="Articles vendus" /><StatCard icon={Banknote} tone="orange" value={<span className="whitespace-nowrap text-lg" data-testid="sum-cash">{fcfa(s.by.cash.total)}</span>} label="Espèces attendues en caisse" /></div>
      <div className="flex flex-wrap gap-2 text-sm">{Object.entries(s.by as Record<string, any>).map(([k, v]) => <span key={k} className="rounded-full bg-white px-3.5 py-1.5 ring-1 ring-line"><b>{METHOD[k]}</b> {fcfa(v.total)} <span className="text-slate-400">({v.count})</span></span>)}</div>
      {!data.sales.length ? <EmptyState icon={ReceiptText}>Aucune vente ce jour.</EmptyState> : <div className="overflow-x-auto rounded-3xl border border-line bg-white"><table className="w-full min-w-[640px] text-sm"><thead className="border-b border-line bg-surface text-left text-xs text-slate-500"><tr><th className="px-5 py-3 font-semibold">Ticket</th><th className="px-3 py-3 font-semibold">Heure</th><th className="px-3 py-3 font-semibold">Articles</th><th className="px-3 py-3 font-semibold">Paiement</th><th className="px-3 py-3 text-right font-semibold">Total</th><th className="px-5 py-3" /></tr></thead>
        <tbody className="divide-y divide-line">{data.sales.map((x: any) => (<tr key={x.id} data-testid="pos-sale" className={cn(x.status === "voided" && "opacity-50")}><td className="px-5 py-3 font-bold">n° {x.number}</td><td className="px-3 py-3 text-slate-500">{new Date(x.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
          <td className="max-w-[260px] truncate px-3 py-3">{(x.items as any[]).map((i) => `${i.quantity}× ${i.title}`).join(", ")}</td><td className="px-3 py-3">{METHOD[x.payment_method]}{x.status === "voided" && <Badge tone="red" className="ml-2">Annulée</Badge>}</td><td className="px-3 py-3 text-right font-bold">{fcfa(x.total)}</td>
          <td className="px-5 py-3"><div className="flex justify-end gap-1"><button onClick={() => printReceipt(x, shop as any)} aria-label={`Réimprimer le ticket ${x.number}`} title="Réimprimer" className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-surface hover:text-ink"><Printer className="size-4" /></button>
            {x.status === "completed" && <button onClick={() => void_(x)} aria-label={`Annuler le ticket ${x.number}`} title="Annuler la vente" data-testid="void-sale" className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"><Undo2 className="size-4" /></button>}</div></td></tr>))}</tbody></table></div>}</>}
  </div>)
}

function Inner() {
  const [tab, setTab] = useState<"register" | "sales">("register")
  return (<div className="space-y-6"><div className="inline-flex rounded-full bg-white p-1 ring-1 ring-line">{([["register", "Caisse"], ["sales", "Ventes et clôture"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} data-testid={`pos-tab-${k}`} className={cn("rounded-full px-5 py-1.5 text-sm font-bold transition", tab === k ? "bg-ink text-white" : "text-slate-500 hover:text-ink")}>{l}</button>)}</div>{tab === "register" ? <Register /> : <Sales />}</div>)
}
export default function VendorPos() { return <Shell title="Caisse" subtitle="Vendez en boutique : le stock baisse tout de suite et le ticket s'imprime."><Inner /></Shell> }
