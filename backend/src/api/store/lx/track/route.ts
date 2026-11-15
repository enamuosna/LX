import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx, norm } from "../../../../lib/lx"

// Suivi : numéro de commande + téléphone → sous-commandes par boutique.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const ref = Number(String(req.query.ref || "").replace(/\D/g, "")), phone = norm(String(req.query.phone || ""))
  if (!ref || !phone) return res.status(400).json({ message: "Numéro de commande et téléphone requis." })
  const rows = await lx(req.scope).listShopOrders({ order_display_id: ref, customer_phone: phone } as any, { relations: ["shop", "courier"] })
  if (!rows.length) return res.status(404).json({ message: "Commande introuvable." })
  res.json({ order_display_id: ref, shop_orders: rows.map((r: any) => ({
    id: r.id, status: r.status, escalated: r.escalated, payment_status: r.payment_status, items: r.items, subtotal: r.subtotal,
    shop: r.shop?.name, courier: r.courier?.name ?? null, created_at: r.created_at,
    delivery_code: r.status === "delivered" ? null : r.delivery_code, payment_method: r.payment_method, payment_ref: r.payment_ref,
  })) })
}
