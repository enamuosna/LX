"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import Shell, { STATUS, useVendor } from "@/components/vendor/Shell"
import { fcfa } from "@/lib/medusa"
import { vendorApi } from "@/lib/vendor"

const LIMIT_MIN = 30
const STEPS: [string, string][] = [["pending", "Reçue"], ["confirmed", "Confirmée"], ["picked_up", "Colis récupéré"], ["delivered", "Livrée"]]
const FILTERS: [string, string][] = [["all", "Toutes"], ["pending", "À traiter"], ["confirmed", "Confirmées"], ["picked_up", "En route"], ["delivered", "Livrées"], ["closed", "Refusées / annulées"]]

function Progress({ status }: { status: string }) {
  const idx = STEPS.findIndex(([s]) => s === status)
  if (idx < 0) return null
  return <div className="vd-steps">{STEPS.map(([s, l], i) => <div key={s} className={`vd-step ${i < idx || status === "delivered" ? "done" : ""} ${i === idx && status !== "delivered" ? "cur" : ""}`}><div className="dot" />{l}</div>)}</div>
}

function Timer({ created, escalated }: { created: string; escalated: boolean }) {
  const [now, setNow] = useState(Date.now()); useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const left = Math.round((new Date(created).getTime() + LIMIT_MIN * 60000 - now) / 60000)
  if (escalated || left <= 0) return <span className="vd-timer red"><i className="fa fa-exclamation-triangle" /> Délai dépassé — Lx a pris le relais</span>
  return <span className="vd-timer"><i className="fa fa-clock-o" /> Répondez sous {left} min</span>
}

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
  const shown = (orders || []).filter((o) => filter === "all" || (filter === "closed" ? ["rejected", "cancelled"].includes(o.status) : o.status === filter))
  const count = (f: string) => (orders || []).filter((o) => f === "all" || (f === "closed" ? ["rejected", "cancelled"].includes(o.status) : o.status === f)).length

  return (<>
    {stats.late > 0 && <div className="vd-banner red"><i className="fa fa-exclamation-triangle" /><div><b>{stats.late} commande(s) sans réponse depuis plus de {LIMIT_MIN} min.</b><br />Lx a été prévenu : confirmez ou refusez rapidement pour éviter une annulation.</div></div>}
    <div className="vd-kpis">
      <div className={`vd-kpi ${stats.todo ? "warn" : ""}`}><div className="ic ic-o"><i className="fa fa-bell" /></div><div><div className="v">{stats.todo}</div><div className="l">À traiter</div></div></div>
      <div className="vd-kpi"><div className="ic ic-b"><i className="fa fa-truck" /></div><div><div className="v">{stats.run}</div><div className="l">En cours de livraison</div></div></div>
      <div className="vd-kpi"><div className="ic ic-g"><i className="fa fa-check" /></div><div><div className="v">{stats.done}</div><div className="l">Commandes livrées</div></div></div>
      <div className="vd-kpi"><div className="ic ic-y"><i className="fa fa-money" /></div><div><div className="v" style={{ fontSize: 20 }}>{fcfa(stats.sales)}</div><div className="l">Ventes livrées</div></div></div>
    </div>
    <div className="vd-chips">{FILTERS.map(([f, l]) => <button key={f} className={`vd-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{l}<span>{count(f)}</span></button>)}
      <span style={{ marginLeft: "auto", color: "#9aa1ad", fontSize: 12, alignSelf: "center" }}>{updated && `Mis à jour ${updated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}</span></div>

    {!orders ? <div className="vd-orders"><div className="vd-sk" /><div className="vd-sk" /></div> : !shown.length ? <div className="vd-empty"><i className="fa fa-inbox" />Aucune commande dans cette catégorie.</div> :
      <div className="vd-orders">{shown.map((o) => {
        const known = o.status !== "pending" && o.customer_phone
        return (<article key={o.id} className={`vd-order ${o.status === "pending" ? (o.escalated ? "late" : "new") : ""}`}>
          <div className="vd-oh"><div><span className="id">#{o.order_display_id}</span><span className="dt">{new Date(o.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
            <span className={`vd-badge b-${o.status}`}>{STATUS[o.status]}</span></div>
          <Progress status={o.status} />
          <div className="vd-ob">
            <div><ul className="vd-items">{o.items.map((i: any, k: number) => <li key={k}><span><span className="q">{i.quantity}×</span>{i.title}</span><span>{fcfa(i.unit_price * i.quantity)}</span></li>)}</ul>
              <div className="vd-tot"><span>Total produits</span><span>{fcfa(o.subtotal)}</span></div></div>
            {known ? <div className="vd-cust"><h5>Client</h5><b>{o.customer_name}</b><br /><i className="fa fa-phone" /> <a href={`tel:+${o.customer_phone}`}>+{o.customer_phone}</a> · <a href={`https://wa.me/${o.customer_phone}`} target="_blank" rel="noreferrer">WhatsApp</a><br /><i className="fa fa-map-marker" /> {o.address}
              {o.note && <div className="note"><i className="fa fa-comment-o" /> {o.note}</div>}</div>
              : <div className="vd-cust lock"><i className="fa fa-lock" style={{ fontSize: 20 }} /><span>Les coordonnées du client s&apos;affichent après confirmation de la commande.</span></div>}
          </div>
          {o.status === "pending" && <div className="vd-of"><Timer created={o.created_at} escalated={o.escalated} />
            {shop.status === "approved" && <div className="vd-act"><button className="vd-btn dng sm" disabled={busy === o.id} onClick={() => act(o, "reject")}>Refuser</button><button className="vd-btn pri sm" disabled={busy === o.id} onClick={() => act(o, "confirm")}><i className="fa fa-check" /> Confirmer</button></div>}</div>}
          {o.status === "confirmed" && <div className="vd-of"><span className="vd-timer" style={{ color: "#0B7A43" }}><i className="fa fa-cube" /> Préparez le colis : le livreur Lx passera le récupérer scellé.</span></div>}
        </article>)
      })}</div>}
    <p style={{ fontSize: 12, color: "#9aa1ad", marginTop: 18 }}>Lx n&apos;effectue aucun contrôle qualité : la conformité des produits relève de votre boutique (garantie légale de conformité).</p>
  </>)
}
export default function VendorHome() { return <Shell title="Tableau de bord" subtitle="Suivez et traitez vos commandes en temps réel."><Dashboard /></Shell> }
