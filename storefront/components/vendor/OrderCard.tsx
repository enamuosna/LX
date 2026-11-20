"use client"
import { AlertTriangle, Clock, Lock, MapPin, MessageSquare, Package, Phone, Printer, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import Badge, { type Tone } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Stepper from "@/components/ui/Stepper"
import { cn } from "@/lib/cn"
import { fcfa } from "@/lib/medusa"
import { STATUS } from "./Shell"

export const LIMIT_MIN = 30
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string))
/** Bon de préparation imprimable : à glisser dans le colis ou à garder en caisse. */
function printSlip(o: any, shopName: string) {
  const w = window.open("", "_blank", "width=720,height=900"); if (!w) return
  const rows = o.items.map((i: any) => `<tr><td>${esc(i.title)}</td><td class="r">${i.quantity}</td><td class="r">${fcfa(i.unit_price)}</td><td class="r">${fcfa(i.unit_price * i.quantity)}</td></tr>`).join("")
  w.document.write(`<!doctype html><meta charset="utf-8"><title>Commande #${o.order_display_id}</title><style>body{font:14px system-ui,sans-serif;margin:32px;color:#10231a}h1{margin:0 0 4px;font-size:22px}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left}.r{text-align:right}.tot td{font-weight:700;border-top:2px solid #10231a}.box{border:1px dashed #999;padding:12px;border-radius:8px;margin-top:12px}</style>
  <h1>${esc(shopName)}</h1><div>Bon de préparation, commande Lx #${o.order_display_id}, ${new Date(o.created_at).toLocaleString("fr-FR")}</div>
  <table><tr><th>Produit</th><th class="r">Qté</th><th class="r">Prix</th><th class="r">Total</th></tr>${rows}<tr class="tot"><td colspan="3">Total produits</td><td class="r">${fcfa(o.subtotal)}</td></tr></table>
  <div>Paiement : ${o.payment_status === "paid" ? "payé" : "à encaisser"}${o.payment_method && o.payment_method !== "cod" ? ` (${esc(o.payment_method)}${o.payment_ref ? ", réf. " + esc(o.payment_ref) : ""})` : ""}</div>
  ${o.customer_name ? `<div class="box"><b>${esc(o.customer_name)}</b><br>${esc(o.address)}<br>${esc(o.customer_phone)}${o.note ? "<br><i>" + esc(o.note) + "</i>" : ""}</div>` : ""}
  <div class="box">Colis scellé remis au livreur Lx. Code de livraison : demandé au client à la réception.</div><script>window.onload=()=>window.print()</script>`)
  w.document.close()
}
const STEPS = ["Reçue", "Confirmée", "Colis récupéré", "Livrée"], IDX: Record<string, number> = { pending: 0, confirmed: 1, picked_up: 2, delivered: 3 }
const TONE: Record<string, Tone> = { pending: "orange", confirmed: "blue", picked_up: "blue", delivered: "green", rejected: "red", cancelled: "gray" }

function Timer({ created, escalated }: { created: string; escalated: boolean }) {
  const [now, setNow] = useState(Date.now()); useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const left = Math.round((new Date(created).getTime() + LIMIT_MIN * 60000 - now) / 60000)
  if (escalated || left <= 0) return <span className="flex items-center gap-1.5 text-sm font-semibold text-red-700"><AlertTriangle className="size-4" />Délai dépassé, Lx a pris le relais</span>
  return <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-700"><Clock className="size-4" />Répondez sous {left} min</span>
}

const PAYLABEL: Record<string, string> = { cod: "À la livraison", wave: "Wave", orange_money: "Orange Money", card: "Carte bancaire" }
export default function OrderCard({ o, canAct, busy, onAct, shopName = "Ma boutique" }: { o: any; canAct: boolean; busy: boolean; onAct: (a: "confirm" | "reject" | "mark_paid") => void; shopName?: string }) {
  const known = o.status !== "pending" && o.customer_phone
  return (<article data-testid="vendor-order" data-status={o.status} className={cn("overflow-hidden rounded-2xl border bg-white", o.status === "pending" ? (o.escalated ? "border-red-300 ring-2 ring-red-100" : "border-amber-300 ring-2 ring-amber-100") : "border-line")}>
    <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <div><span className="text-lg font-extrabold">#{o.order_display_id}</span><span className="ml-3 text-xs text-slate-500">{new Date(o.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
      <div className="flex items-center gap-2">{o.status !== "pending" && o.status !== "rejected" && <button onClick={() => printSlip(o, shopName)} aria-label="Imprimer le bon de préparation" title="Imprimer le bon de préparation" data-testid="print-slip" className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-surface hover:text-ink"><Printer className="size-4" /></button>}<Badge tone={TONE[o.status] ?? "gray"}>{STATUS[o.status] ?? o.status}</Badge></div></header>
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
    {o.status !== "rejected" && o.status !== "cancelled" && <div data-testid="pay-info" className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm"><span className="flex items-center gap-2 text-slate-600"><Smartphone className="size-4 text-slate-400" />Paiement : <b>{PAYLABEL[o.payment_method] ?? "À la livraison"}</b>{o.payment_ref ? `, réf. ${o.payment_ref}` : ""}, {o.payment_status === "paid" ? "reçu" : "à encaisser"}</span>
      {canAct && o.payment_status === "unpaid" && ["wave", "orange_money"].includes(o.payment_method) && <Button size="sm" variant="secondary" disabled={busy} data-testid="mark-paid" onClick={() => onAct("mark_paid")}>Paiement reçu</Button>}</div>}
    {o.status === "confirmed" && <footer className="flex items-center gap-2 border-t border-line bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700"><Package className="size-4" />Préparez le colis : le livreur Lx passera le récupérer scellé.</footer>}
  </article>)
}
