import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../lib/lx"
import { currentShop } from "../../../lib/vendor"

// Statistiques de la boutique : ventes livrées sur 14 jours, produits les plus vendus, délai moyen de confirmation.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  const rows: any[] = await lx(req.scope).listShopOrders({ shop_id: shop.id } as any, { take: 1000 })
  const days: { day: string; sales: number; orders: number }[] = []
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push({ day: d.toISOString().slice(0, 10), sales: 0, orders: 0 }) }
  const top = new Map<string, { title: string; qty: number; revenue: number }>()
  for (const o of rows) {
    if (o.status !== "delivered") continue
    const d = days.find((x) => x.day === new Date(o.created_at).toISOString().slice(0, 10)); if (d) { d.sales += o.subtotal; d.orders += 1 }
    for (const i of o.items as any[]) { const t = top.get(i.product_id) || { title: i.title, qty: 0, revenue: 0 }; t.qty += i.quantity; t.revenue += i.quantity * i.unit_price; top.set(i.product_id, t) }
  }
  const done = rows.filter((o) => o.status !== "pending" && o.status !== "rejected" && o.status !== "cancelled")
  const rejected = rows.filter((o) => o.status === "rejected").length
  res.json({
    days, total_sales: rows.filter((o) => o.status === "delivered").reduce((s, o) => s + o.subtotal, 0),
    delivered: rows.filter((o) => o.status === "delivered").length, rejected, accept_rate: rows.length ? Math.round((done.length / rows.length) * 100) : null,
    top: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
  })
}
