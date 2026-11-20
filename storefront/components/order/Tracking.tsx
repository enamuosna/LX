"use client"
import { useEffect, useState } from "react"
import Badge, { type Tone } from "@/components/ui/Badge"
import Banner from "@/components/ui/Banner"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import Stepper from "@/components/ui/Stepper"
import { fcfa, store } from "@/lib/medusa"
import { KeyRound, Smartphone } from "lucide-react"
import ReviewForm from "./ReviewForm"

const LABEL: Record<string, string> = { pending: "En attente boutique", confirmed: "Confirmée", rejected: "Refusée par la boutique", picked_up: "Colis récupéré, en route", delivered: "Livrée", cancelled: "Annulée" }
const TONE: Record<string, Tone> = { pending: "orange", confirmed: "blue", picked_up: "blue", delivered: "green", rejected: "red", cancelled: "red" }
const STEPS = ["Reçue", "Confirmée", "En route", "Livrée"], IDX: Record<string, number> = { pending: 0, confirmed: 1, picked_up: 2, delivered: 3 }

export default function Tracking({ refNo, phone }: { refNo: string; phone: string }) {
  const [d, setD] = useState<any>(null), [err, setErr] = useState("")
  useEffect(() => {
    if (!refNo || !phone) return
    const load = () => store(`/store/lx/track?ref=${encodeURIComponent(refNo)}&phone=${encodeURIComponent(phone)}`).then((x) => { setD(x); setErr("") }).catch((e) => { setD(null); setErr(e.message) })
    load(); const t = setInterval(load, 20000); return () => clearInterval(t)
  }, [refNo, phone])
  if (err) return <Banner tone="danger">{err}</Banner>
  if (!d) return null
  return (<div className="space-y-5" data-testid="tracking">
    <h2 className="text-xl font-bold">Commande #{d.order_display_id}</h2>
    {d.shop_orders.map((s: any) => (<Card key={s.id}>
      <CardHeader><div className="font-bold">{s.shop ? `Boutique ${s.shop}` : "Boutique"}</div><Badge tone={TONE[s.status] ?? "gray"}>{LABEL[s.status] ?? s.status}</Badge></CardHeader>
      {s.status in IDX && <Stepper steps={STEPS} current={IDX[s.status]} finished={s.status === "delivered"} />}
      <CardBody className="space-y-3">
        {s.delivery_code && !["delivered", "rejected", "cancelled"].includes(s.status) && <div data-testid="delivery-code" className="flex items-center gap-3 rounded-2xl bg-accent-500/15 p-4"><KeyRound className="size-6 shrink-0 text-yellow-800" /><div><p className="text-sm text-slate-600">Code de livraison : à donner au livreur à la réception</p><p className="font-display text-3xl font-extrabold tracking-[0.3em]">{s.delivery_code}</p></div></div>}
        {["wave", "orange_money"].includes(s.payment_method) && s.payment_status === "unpaid" && <p className="flex items-center gap-2 text-sm text-slate-600"><Smartphone className="size-4" />Paiement {s.payment_method === "wave" ? "Wave" : "Orange Money"} en attente de confirmation par la boutique{s.payment_ref ? ` (réf. ${s.payment_ref})` : ""}.</p>}
        {s.status === "pending" && s.escalated && <Banner tone="warn">Lx a pris le relais auprès de la boutique.</Banner>}
        <p className="text-sm text-slate-600">{s.courier ? <>Livreur : <strong>{s.courier}</strong>. </> : null}Paiement : {s.payment_status === "paid" ? "payé" : "à régler"}</p>
        <ul className="divide-y divide-line text-sm">{s.items.map((i: any, k: number) => <li key={k} className="flex justify-between py-2"><span>{i.quantity} × {i.title}</span><span className="font-semibold">{fcfa(i.unit_price * i.quantity)}</span></li>)}
          <li className="flex justify-between py-2 font-bold"><span>Total produits</span><span>{fcfa(s.subtotal)}</span></li></ul>
        {s.status === "delivered" && s.items.filter((i: any) => i.product_id).map((i: any) => <ReviewForm key={i.product_id} refNo={refNo} phone={phone} item={i} />)}</CardBody></Card>))}
    <p className="text-xs text-slate-500">Les frais de livraison Lx sont inclus dans le total de la commande. Cette page se met à jour automatiquement.</p></div>)
}
