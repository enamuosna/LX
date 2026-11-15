"use client"
import { BadgeCheck, Banknote, PackageCheck, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import StatCard, { CountUp } from "@/components/ui/StatCard"
import Shell, { useVendor } from "@/components/vendor/Shell"
import { fcfa } from "@/lib/medusa"
import { vendorApi } from "@/lib/vendor"

type Stats = { days: { day: string; sales: number; orders: number }[]; total_sales: number; delivered: number; rejected: number; accept_rate: number | null; top: { title: string; qty: number; revenue: number }[] }

function SalesChart({ days }: { days: Stats["days"] }) {
  const max = Math.max(1, ...days.map((d) => d.sales)), W = 700, H = 220, bw = W / days.length
  return (<div><svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" role="img" aria-label="Ventes livrées des 14 derniers jours">
    {[0, 0.5, 1].map((t) => <line key={t} x1="0" x2={W} y1={H - t * H} y2={H - t * H} stroke="currentColor" className="text-line" strokeDasharray={t ? "4 6" : undefined} />)}
    {days.map((d, i) => { const h = Math.max(d.sales ? 6 : 0, (d.sales / max) * (H - 10)); return (<g key={d.day}>
      <rect x={i * bw + bw * 0.18} y={H - h} width={bw * 0.64} height={h} rx="8" className="origin-bottom fill-brand-600 transition hover:fill-accent-500" style={{ transformBox: "fill-box", animation: `bar-grow 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both` }}><title>{`${new Date(d.day).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} : ${fcfa(d.sales)} (${d.orders} commande${d.orders > 1 ? "s" : ""})`}</title></rect>
      {(i % 2 === 0 || days.length < 8) && <text x={i * bw + bw / 2} y={H + 20} textAnchor="middle" className="fill-slate-400 text-[11px]">{new Date(d.day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</text>}</g>) })}</svg>
    <style>{`@keyframes bar-grow{from{transform:scaleY(0)}}`}</style></div>)
}

function Inner() {
  const { toast } = useVendor(); const [s, setS] = useState<Stats | null>(null)
  useEffect(() => { vendorApi("/stats").then(setS).catch((e) => toast(e.message, true)) }, [toast])
  if (!s) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-72" /></div>
  const week = s.days.slice(-7).reduce((t, d) => t + d.sales, 0)
  return (<div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard icon={Banknote} tone="green" value={<span className="text-xl"><CountUp value={week} format={fcfa} /></span>} label="Ventes des 7 derniers jours" />
      <StatCard icon={Banknote} tone="yellow" value={<span className="text-xl"><CountUp value={s.total_sales} format={fcfa} /></span>} label="Ventes livrées au total" />
      <StatCard icon={PackageCheck} tone="blue" value={<CountUp value={s.delivered} />} label="Commandes livrées" />
      <StatCard icon={BadgeCheck} tone="orange" value={s.accept_rate === null ? "n/a" : <CountUp value={s.accept_rate} format={(n) => `${n} %`} />} label="Commandes acceptées" /></div>
    <Card><CardHeader><h2 className="text-lg font-bold">Ventes livrées, 14 derniers jours</h2></CardHeader><CardBody><SalesChart days={s.days} /></CardBody></Card>
    <Card><CardHeader><h2 className="flex items-center gap-2 text-lg font-bold"><Trophy className="size-5 text-accent-500" />Produits les plus vendus</h2></CardHeader>
      {s.top.length ? <ol className="divide-y divide-line">{s.top.map((t, i) => (<li key={t.title} data-testid="top-product" className="flex items-center gap-4 px-6 py-4"><span className="grid size-8 place-items-center rounded-full bg-surface font-display font-bold">{i + 1}</span><span className="flex-1 font-semibold">{t.title}</span><span className="text-sm text-slate-500">{t.qty} vendu{t.qty > 1 ? "s" : ""}</span><b>{fcfa(t.revenue)}</b></li>))}</ol>
        : <div className="p-6"><EmptyState icon={Trophy}>Vos meilleurs produits apparaîtront après vos premières livraisons.</EmptyState></div>}</Card>
  </div>)
}
export default function VendorStats() { return <Shell title="Statistiques" subtitle="Vos ventes et vos produits qui marchent le mieux."><Inner /></Shell> }
