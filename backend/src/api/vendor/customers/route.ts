import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../lib/lx"
import { currentShop } from "../../../lib/vendor"

// Clients de la boutique : regroupés par téléphone, uniquement à partir des commandes confirmées (les coordonnées d'une commande en attente restent masquées).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  const rows: any[] = await lx(req.scope).listShopOrders({ shop_id: shop.id } as any, { order: { created_at: "DESC" }, take: 2000 })
  const map = new Map<string, { name: string; phone: string; address: string; orders: number; delivered: number; spent: number; last: string }>()
  for (const o of rows) {
    if (["pending", "rejected", "cancelled"].includes(o.status)) continue
    const c = map.get(o.customer_phone) || { name: o.customer_name, phone: o.customer_phone, address: o.address, orders: 0, delivered: 0, spent: 0, last: o.created_at }
    c.orders += 1; if (o.status === "delivered") { c.delivered += 1; c.spent += o.subtotal }
    if (new Date(o.created_at) > new Date(c.last)) c.last = o.created_at
    map.set(o.customer_phone, c)
  }
  res.json({ customers: [...map.values()].sort((a, b) => b.spent - a.spent || b.orders - a.orders) })
}
