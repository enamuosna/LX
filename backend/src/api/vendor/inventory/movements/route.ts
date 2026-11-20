import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../lib/lx"
import { currentShop } from "../../../../lib/vendor"

// Journal des mouvements (tous les produits, ou un seul avec ?product_id=).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req), pid = req.query.product_id ? String(req.query.product_id) : null
  const rows = await lx(req.scope).listStockMovements({ shop_id: shop.id, ...(pid ? { product_id: pid } : {}) } as any, { order: { created_at: "DESC" }, take: Math.min(Number(req.query.limit) || 100, 500) })
  res.json({ movements: rows })
}
