import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx, waLink, shopAlertText } from "../../../../lib/lx"
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const filters: any = {}; if (req.query.status) filters.status = String(req.query.status)
  const rows: any[] = await lx(req.scope).listShopOrders(filters, { relations: ["shop", "courier"], order: { created_at: "DESC" }, take: 200 })
  rows.sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || Number(b.escalated) - Number(a.escalated))
  res.json({ shop_orders: rows.map((r) => ({ ...r, whatsapp_link: r.status === "pending" && r.shop ? waLink(r.shop.phone, shopAlertText(r)) : null })) })
}
