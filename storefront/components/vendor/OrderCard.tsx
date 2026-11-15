"use client"
import { AlertTriangle, Clock, Lock, MapPin, MessageSquare, Package, Phone } from "lucide-react"
import { useEffect, useState } from "react"
import Badge, { type Tone } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Stepper from "@/components/ui/Stepper"
import { cn } from "@/lib/cn"
import { fcfa } from "@/lib/medusa"
import { STATUS } from "./Shell"

export const LIMIT_MIN = 30
const STEPS = ["Reçue", "Confirmée", "Colis récupéré", "Livrée"], IDX: Record<string, number> = { pending: 0, confirmed: 1, picked_up: 2, delivered: 3 }
const TONE: Record<string, Tone> = { pending: "orange", confirmed: "blue", picked_up: "blue", delivered: "green", rejected: "red", cancelled: "gray" }

function Timer({ created, escalated }: { created: string; escalated: boolean }) {
  const [now, setNow] = useState(Date.now()); useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const left = Math.round((new Date(created).getTime() + LIMIT_MIN * 60000 - now) / 60000)
  if (escalated || left <= 0) return <span className="flex items-center gap-1.5 text-sm font-semibold text-red-700"><AlertTriangle className="size-4" />Délai dépassé, Lx a pris le relais</span>
  return <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-700"><Clock className="size-4" />Répondez sous {left} min</span>
}

export default function OrderCard({ o, canAct, busy, onAct }: { o: any; canAct: boolean; busy: boolean; onAct: (a: "confirm" | "reject") => void }) {
  const known = o.status !== "pending" && o.customer_phone
  return (<article data-testid="vendor-order" data-status={o.status} className={cn("overflow-hidden rounded-2xl border bg-white", o.status === "pending" ? (o.escalated ? "border-red-300 ring-2 ring-red-100" : "border-amber-300 ring-2 ring-amber-100") : "border-line")}>
    <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <div><span className="text-lg font-extrabold">#{o.order_display_id}</span><span className="ml-3 text-xs text-slate-500">{new Date(o.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
      <Badge tone={TONE[o.status] ?? "gray"}>{STATUS[o.status] ?? o.status}</Badge></header>
    {o.status in IDX && <Stepper steps={STEPS} current={IDX[o.status]} finished={o.status === "delivered"} />}
    <div className="grid gap-5 p-5 md:grid-cols-2">
      <div><ul className="divide-y divide-line text-sm">{o.items.map((i: any, k: number) => <li key={k} className="flex justify-between gap-3 py-2"><span><b className="mr-1.5 text-brand-600">{i.quantity}×</b>{i.title}</span><span className="font-semibold">{fcfa(i.unit_price * i.quantity)}</span></li>)}</ul>
        <div className="mt-2 flex justify-between border-t-2 border-line pt-3 font-bold"><span>Total produits</span><span>{fcfa(o.subtotal)}</span></div></div>
      {known ? <div className="space-y-1.5 rounded-xl bg-surface p-4 text-sm"><h5 className="text-[11px] font-bold tracking-wide text-slate-400">Client</h5><p className="font-bold">{o.customer_name}</p>
        <p className="flex items-center gap-1.5"><Phone className="size-3.5 text-slate-400" /><a className="text-brand-600 hover:underline" href={`tel:+${o.customer_phone}`}>+{o.customer_phone}</a> <span className="text-slate-300">|</span> <a className="text-brand-600 hover:underline" href={`https://wa.me/${o.customer_phone}`} target="_blank" rel="noreferrer">WhatsApp</a></p>
        <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />{o.address}</p>
        {o.note && <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-amber-900"><MessageSquare className="mt-0.5 size-3.5 shrink-0" />{o.note}</p>}</div>
        : <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-surface p-4 text-sm text-slate-500"><Lock className="size-5 shrink-0" />Les coordonnées du client s&apos;affichent après confirmation de la commande.</div>}
    </div>
    {o.status === "pending" && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-slate-50 px-5 py-3"><Timer created={o.created_at} escalated={o.escalated} />
      {canAct && <div className="flex gap-2"><Button variant="danger" size="sm" disabled={busy} data-testid="reject" onClick={() => onAct("reject")}>Refuser</Button><Button size="sm" disabled={busy} data-testid="confirm" onClick={() => onAct("confirm")}>Confirmer</Button></div>}</footer>}
    {o.status === "confirmed" && <footer className="flex items-center gap-2 border-t border-line bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700"><Package className="size-4" />Préparez le colis : le livreur Lx passera le récupérer scellé.</footer>}
  </article>)
}
