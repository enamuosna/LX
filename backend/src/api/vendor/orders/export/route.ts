import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../lib/lx"
import { currentShop } from "../../../../lib/vendor"

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
// Export CSV (ouvrable dans Excel) de toutes les commandes de la boutique.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  const rows: any[] = await lx(req.scope).listShopOrders({ shop_id: shop.id } as any, { order: { created_at: "DESC" }, take: 5000 })
  const head = ["Commande", "Date", "Statut", "Paiement", "Articles", "Total produits (FCFA)", "Client", "Téléphone", "Adresse"]
  const lines = rows.map((o) => [o.order_display_id, new Date(o.created_at).toLocaleString("fr-FR"), o.status, o.payment_status === "paid" ? "payé" : "non payé",
    (o.items as any[]).map((i) => `${i.quantity}x ${i.title}`).join(" | "), o.subtotal, o.status === "pending" ? "" : o.customer_name, o.status === "pending" ? "" : o.customer_phone, o.status === "pending" ? "" : o.address].map(esc).join(";"))
  res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename="commandes-lx.csv"`)
  res.send("﻿" + [head.map(esc).join(";"), ...lines].join("\r\n"))
}
