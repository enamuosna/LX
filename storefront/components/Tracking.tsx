"use client"
import { useEffect, useState } from "react"
import { fcfa, store } from "@/lib/medusa"
const LABEL: Record<string, string> = { pending: "En attente boutique", confirmed: "Confirmée", rejected: "Refusée par la boutique", picked_up: "Colis récupéré – en route", delivered: "Livrée", cancelled: "Annulée" }
export default function Tracking({ refNo, phone }: { refNo: string; phone: string }) {
  const [d, setD] = useState<any>(null), [err, setErr] = useState("")
  useEffect(() => { if (!refNo || !phone) return; const load = () => store(`/store/lx/track?ref=${encodeURIComponent(refNo)}&phone=${encodeURIComponent(phone)}`).then(setD).catch((e) => { setD(null); setErr(e.message) }); load(); const t = setInterval(load, 20000); return () => clearInterval(t) }, [refNo, phone])
  if (err) return <div className="alert alert-danger">{err}</div>
  if (!d) return null
  return (<div><h3>Commande #{d.order_display_id}</h3>
    {d.shop_orders.map((s: any) => <div key={s.id} style={{ marginBottom: 25 }}>
      <div className="alert alert-success"><strong>{s.shop}</strong> — <span className={`badge-s badge-${s.status}`}>{LABEL[s.status]}</span>{s.status === "pending" && s.escalated && " · Lx a pris le relais auprès de la boutique."}</div>
      <p>{s.courier ? <>Livreur : <strong>{s.courier}</strong> · </> : null}Paiement : {s.payment_status === "paid" ? "payé" : "à régler"}</p>
      <table className="tbl"><tbody>{s.items.map((i: any, k: number) => <tr key={k}><td>{i.quantity} × {i.title}</td><td style={{ textAlign: "right" }}>{fcfa(i.unit_price * i.quantity)}</td></tr>)}<tr><th>Total produits</th><th style={{ textAlign: "right" }}>{fcfa(s.subtotal)}</th></tr></tbody></table></div>)}
    <p style={{ fontSize: 12 }}>Les frais de livraison Lx sont inclus dans le total de la commande. Cette page se met à jour automatiquement.</p></div>)
}
