import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { lx } from "../../../../lib/lx"

// Pour le paiement : les boutiques présentes dans le panier, ce qui revient à chacune et ses numéros Wave / Orange Money.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = String(req.query.cart_id || "")
  if (!cartId) return res.status(400).json({ message: "cart_id requis." })
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [cart] } = await query.graph({ entity: "cart", fields: ["id", "items.product_id", "items.unit_price", "items.quantity"], filters: { id: cartId } })
  if (!cart) return res.status(404).json({ message: "Panier introuvable." })
  const ids = [...new Set((cart.items ?? []).map((i: any) => i.product_id).filter(Boolean))]
  const { data: products } = await query.graph({ entity: "product", fields: ["id", "shop.id"], filters: { id: ids as string[] } })
  const shopOf = new Map<string, string>(products.map((p: any) => [p.id, p.shop?.id]))
  const totals = new Map<string, number>()
  for (const i of (cart.items ?? []) as any[]) { const sid = shopOf.get(i.product_id); if (sid) totals.set(sid, (totals.get(sid) || 0) + Number(i.unit_price) * i.quantity) }
  const shops = await Promise.all([...totals.keys()].map((id) => lx(req.scope).retrieveShop(id)))
  res.json({ shops: shops.map((s: any) => ({ id: s.id, code: s.code, subtotal: totals.get(s.id), wave: s.wave_number, om: s.om_number })) })
}
