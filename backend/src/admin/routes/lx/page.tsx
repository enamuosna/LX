import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Input, Text } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

const api = async (path: string, body?: unknown) => {
  const r = await fetch(`/admin/lx/${path}`, { credentials: "include", method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.message || "Erreur")
  return j
}
const LABEL: Record<string, string> = { pending: "En attente boutique", confirmed: "Confirmée", rejected: "Refusée", picked_up: "Colis récupéré", delivered: "Livrée", cancelled: "Annulée" }
const NEXT: Record<string, string[]> = { pending: ["confirmed", "rejected", "cancelled"], confirmed: ["picked_up", "cancelled"], picked_up: ["delivered"], rejected: [], delivered: [], cancelled: [] }
const ACTION: Record<string, string> = { confirmed: "Confirmer", rejected: "Refuser", cancelled: "Annuler", picked_up: "Colis récupéré", delivered: "Livrée" }
const color = (s: string): "green" | "red" | "orange" | "blue" | "grey" => (["delivered", "approved", "confirmed", "done"].includes(s) ? "green" : ["rejected", "cancelled", "suspended"].includes(s) ? "red" : ["pending", "new"].includes(s) ? "orange" : ["picked_up", "in_progress"].includes(s) ? "blue" : "grey")
const fcfa = (n: number) => `${Number(n).toLocaleString("fr-FR")} FCFA`

const Table = ({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead><tr>{head.map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border-base)" }}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-base)", verticalAlign: "top" }}>{c}</td>)}</tr>)}</tbody>
    </table>
    {!rows.length && <Text className="p-4 text-ui-fg-subtle">Aucune donnée.</Text>}
  </div>
)

const LxPage = () => {
  const [tab, setTab] = useState<"orders" | "shops" | "requests" | "couriers">("orders")
  const [data, setData] = useState<any>({ orders: [], shops: [], requests: [], couriers: [] })
  const [err, setErr] = useState("")
  const [cn, setCn] = useState(""), [cp, setCp] = useState("")

  const load = useCallback(async () => {
    try {
      const [o, s, r, c] = await Promise.all([api("shop-orders"), api("shops"), api("service-requests"), api("couriers")])
      setData({ orders: o.shop_orders, shops: s.shops, requests: r.requests, couriers: c.couriers }); setErr("")
    } catch (e: any) { setErr(e.message) }
  }, [])
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t) }, [load])
  const act = async (path: string, body: unknown) => { try { await api(path, body); await load() } catch (e: any) { setErr(e.message) } }
  const late = data.orders.filter((o: any) => o.status === "pending" && o.escalated).length

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading>Lx : exploitation</Heading>
        <Text className="text-ui-fg-subtle">{data.orders.length} sous-commandes · {late} à relancer · {data.shops.filter((s: any) => s.status === "pending").length} boutique(s) à valider</Text>
        <div className="mt-3 flex gap-2">
          {([["orders", "Commandes boutiques"], ["shops", "Boutiques"], ["requests", "OUTIKO / JEULIKO"], ["couriers", "Livreurs"]] as const).map(([k, l]) =>
            <Button key={k} size="small" variant={tab === k ? "primary" : "secondary"} onClick={() => setTab(k)}>{l}</Button>)}
        </div>
        {err && <Text className="mt-2 text-ui-fg-error">{err}</Text>}
      </div>

      {tab === "orders" && <Table head={["Commande", "Client", "Boutique", "Articles", "Statut", "Livreur", "Actions"]} rows={data.orders.map((o: any) => [
        <>#{o.order_display_id}<br /><small>{new Date(o.created_at).toLocaleString("fr-FR")}</small></>,
        <>{o.customer_name}<br /><small>{o.customer_phone}<br />{o.address}</small></>,
        <>{o.shop?.name}{o.whatsapp_link && <><br /><a href={o.whatsapp_link} target="_blank" rel="noreferrer">📲 Alerter par WhatsApp</a></>}</>,
        <>{(o.items as any[]).map((i, k) => <div key={k}>{i.quantity} × {i.title}</div>)}<b>{fcfa(o.subtotal)}</b><br /><small>{o.payment_status === "paid" ? "payé" : "non payé"}{o.payment_method && o.payment_method !== "cod" ? `, ${o.payment_method}${o.payment_ref ? " réf. " + o.payment_ref : ""}` : ""}</small></>,
        <><Badge color={color(o.status)}>{LABEL[o.status]}</Badge>{o.escalated && o.status === "pending" && <div><small>⚠ sans réponse boutique</small></div>}</>,
        <select value={o.courier?.id || ""} onChange={(e) => act(`shop-orders/${o.id}`, { courier_id: e.target.value })}><option value="">Aucun</option>{data.couriers.filter((c: any) => c.active).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>,
        <div className="flex flex-wrap gap-1">{NEXT[o.status].map((n) => <Button key={n} size="small" variant="secondary" onClick={() => { if (n === "delivered") { const code = window.prompt("Code de livraison donné par le client (4 chiffres) :"); if (code === null) return; act(`shop-orders/${o.id}`, { status: n, code }) } else act(`shop-orders/${o.id}`, { status: n }) }}>{ACTION[n]}</Button>)}
          {o.payment_status === "unpaid" && <Button size="small" variant="secondary" onClick={() => act(`shop-orders/${o.id}`, { payment_status: "paid" })}>Marquer payé</Button>}</div>,
      ])} />}

      {tab === "shops" && <Table head={["Boutique", "Contact", "Statut", ""]} rows={data.shops.map((s: any) => [
        <>{s.name}<br /><small>{s.address}</small></>, <>{s.phone}<br /><small>{s.email}</small></>, <Badge color={color(s.status)}>{s.status}</Badge>,
        <div className="flex gap-1">{s.status !== "approved" && <Button size="small" onClick={() => act(`shops/${s.id}`, { status: "approved" })}>Agréer</Button>}{s.status !== "suspended" && <Button size="small" variant="secondary" onClick={() => act(`shops/${s.id}`, { status: "suspended" })}>Suspendre</Button>}</div>,
      ])} />}

      {tab === "requests" && <Table head={["Date", "Type", "Client", "Détails", "Statut"]} rows={data.requests.map((r: any) => [
        new Date(r.created_at).toLocaleString("fr-FR"), <b>{r.type.toUpperCase()}</b>,
        <>{r.customer_name}<br /><a href={`https://wa.me/${r.customer_phone}`} target="_blank" rel="noreferrer">{r.customer_phone}</a></>,
        <>{r.details}{r.pickup_address && <><br /><small>Récupération : {r.pickup_address}<br />Livraison : {r.delivery_address}</small></>}</>,
        <select value={r.status} onChange={(e) => act(`service-requests/${r.id}`, { status: e.target.value })}>{[["new", "Nouvelle"], ["in_progress", "En cours"], ["done", "Terminée"], ["cancelled", "Annulée"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>,
      ])} />}

      {tab === "couriers" && <div>
        <div className="flex gap-2 p-4"><Input placeholder="Nom" value={cn} onChange={(e) => setCn(e.target.value)} /><Input placeholder="Téléphone" value={cp} onChange={(e) => setCp(e.target.value)} />
          <Button onClick={async () => { await act("couriers", { name: cn, phone: cp }); setCn(""); setCp("") }}>Ajouter</Button></div>
        <Table head={["Livreur", "Téléphone", "Actif", ""]} rows={data.couriers.map((c: any) => [c.name, c.phone, c.active ? "oui" : "non", <Button size="small" variant="secondary" onClick={() => act(`couriers/${c.id}`, { active: !c.active })}>{c.active ? "Désactiver" : "Activer"}</Button>])} />
      </div>}
    </Container>
  )
}
export const config = defineRouteConfig({ label: "Lx", icon: BuildingStorefront })
export default LxPage
