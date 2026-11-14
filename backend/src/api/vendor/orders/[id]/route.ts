import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../lib/lx"
import { currentShop } from "../../../../lib/vendor"
import { afterShopOrderChange } from "../../../../lib/order-sync"

// La boutique confirme ou refuse sa sous-commande.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  if (shop.status !== "approved") return res.status(403).json({ message: "Boutique non validée par Lx." })
  const svc = lx(req.scope)
  const so = await svc.retrieveShopOrder(req.params.id).catch(() => null)
  if (!so || (so as any).shop_id !== shop.id) return res.status(404).json({ message: "Commande introuvable." })
  const next = (req.body as any)?.action === "confirm" ? "confirmed" : (req.body as any)?.action === "reject" ? "rejected" : null
  if (!next) return res.status(400).json({ message: "Action invalide." })
  try { await svc.transition(so.id, next) } catch (e: any) { return res.status(409).json({ message: e.message }) }
  await afterShopOrderChange(req.scope, so.order_id)
  res.json({ ok: true })
}
