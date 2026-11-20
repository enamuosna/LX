import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../../lib/lx"
import { currentShop } from "../../../../../lib/vendor"
import { moveStock } from "../../../../../lib/stock"

// Annulation d'une vente de caisse : le stock est remis en rayon.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req), svc = lx(req.scope)
  const sale: any = await svc.retrievePosSale(req.params.id).catch(() => null)
  if (!sale || sale.shop_id !== shop.id) return res.status(404).json({ message: "Vente introuvable." })
  if (sale.status === "voided") return res.status(409).json({ message: "Cette vente est déjà annulée." })
  for (const i of sale.items as any[]) await moveStock(req.scope, { shopId: shop.id, productId: i.product_id, title: i.title, delta: i.quantity, reason: "pos_void", ref: sale.id, note: `Ticket ${sale.number} annulé` }).catch(() => {})
  const upd = await svc.updatePosSales({ id: sale.id, status: "voided", voided_at: new Date() } as any)
  res.json({ sale: upd })
}
