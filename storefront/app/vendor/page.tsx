"use client"
import { Banknote, Bell, CheckCircle2, Inbox, Truck } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import Banner from "@/components/ui/Banner"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import StatCard from "@/components/ui/StatCard"
import OrderCard, { LIMIT_MIN } from "@/components/vendor/OrderCard"
import Shell, { useVendor } from "@/components/vendor/Shell"
import { cn } from "@/lib/cn"
import { fcfa } from "@/lib/medusa"
import { vendorApi } from "@/lib/vendor"

const FILTERS: [string, string][] = [["all", "Toutes"], ["pending", "À traiter"], ["confirmed", "Confirmées"], ["picked_up", "En route"], ["delivered", "Livrées"], ["closed", "Refusées / annulées"]]
const match = (o: any, f: string) => f === "all" || (f === "closed" ? ["rejected", "cancelled"].includes(o.status) : o.status === f)

function Dashboard() {
  const { shop, toast, setPending } = useVendor()
  const [orders, setOrders] = useState<any[] | null>(null), [filter, setFilter] = useState("all"), [busy, setBusy] = useState<string | null>(null), [updated, setUpdated] = useState<Date | null>(null)
  const load = useCallback(() => vendorApi("/orders").then((d) => { setOrders(d.orders); setUpdated(new Date()); setPending(d.orders.filter((o: any) => o.status === "pending").length) }).catch((e) => toast(e.message, true)), [toast, setPending])
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t) }, [load])

  const act = async (o: any, action: "confirm" | "reject") => {
    if (action === "reject" && !confirm(`Refuser la commande #${o.order_display_id} ?`)) return
    setBusy(o.id)
    try { await vendorApi(`/orders/${o.id}`, { action }); toast(action === "confirm" ? "Commande confirmée — le livreur Lx passera récupérer le colis scellé." : "Commande refusée."); await load() } catch (e: any) { toast(e.message, true) } finally { setBusy(null) }
  }
  const stats = useMemo(() => {
    const l = orders || []
    return { todo: l.filter((o) => o.status === "pending").length, run: l.filter((o) => ["confirmed", "picked_up"].includes(o.status)).length, done: l.filter((o) => o.status === "delivered").length, sales: l.filter((o) => o.status === "delivered").reduce((s, o) => s + o.subtotal, 0), late: l.filter((o) => o.status === "pending" && o.escalated).length }
  }, [orders])
  const shown = (orders || []).filter((o) => match(o, filter))

  return (<div className="space-y-6">
    {stats.late > 0 && <Banner tone="danger" title={`${stats.late} commande(s) sans réponse depuis plus de ${LIMIT_MIN} min.`}>Lx a été prévenu : confirmez ou refusez rapidement pour éviter une annulation.</Banner>}
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard icon={Bell} tone="orange" value={stats.todo} label="À traiter" highlight={stats.todo > 0} />
      <StatCard icon={Truck} tone="blue" value={stats.run} label="En cours de livraison" />
      <StatCard icon={CheckCircle2} tone="green" value={stats.done} label="Commandes livrées" />
      <StatCard icon={Banknote} tone="yellow" value={<span className="text-lg sm:text-xl">{fcfa(stats.sales)}</span>} label="Ventes livrées" /></div>
    <div className="flex flex-wrap items-center gap-2">{FILTERS.map(([f, l]) => (
      <button key={f} onClick={() => setFilter(f)} data-testid={`filter-${f}`} className={cn("flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition", filter === f ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-600")}>
        {l}<span className={cn("rounded-full px-1.5 text-[11px]", filter === f ? "bg-white/25" : "bg-surface")}>{(orders || []).filter((o) => match(o, f)).length}</span></button>))}
      <span className="ml-auto text-xs text-slate-400">{updated && `Mis à jour ${updated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}</span></div>
    {!orders ? <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
      : !shown.length ? <EmptyState icon={Inbox}>Aucune commande dans cette catégorie.</EmptyState>
      : <div className="space-y-4">{shown.map((o) => <OrderCard key={o.id} o={o} canAct={shop.status === "approved"} busy={busy === o.id} onAct={(a) => act(o, a)} />)}</div>}
    <p className="text-xs text-slate-400">Lx n&apos;effectue aucun contrôle qualité : la conformité des produits relève de votre boutique (garantie légale de conformité).</p>
  </div>)
}
export default function VendorHome() { return <Shell title="Tableau de bord" subtitle="Suivez et traitez vos commandes en temps réel."><Dashboard /></Shell> }
