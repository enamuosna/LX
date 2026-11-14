import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../../lib/lx"
import { afterShopOrderChange } from "../../../../../lib/order-sync"
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = lx(req.scope), b = (req.body || {}) as any
  const so = await svc.retrieveShopOrder(req.params.id).catch(() => null)
  if (!so) return res.status(404).json({ message: "Introuvable." })
  try {
    if (b.status) await svc.transition(so.id, b.status)
    if (b.courier_id !== undefined) await svc.updateShopOrders({ id: so.id, courier_id: b.courier_id || null } as any)
    if (b.payment_status === "paid") await svc.updateShopOrders({ id: so.id, payment_status: "paid" } as any)
  } catch (e: any) { return res.status(409).json({ message: e.message }) }
  if (b.status) await afterShopOrderChange(req.scope, so.order_id)
  res.json({ ok: true })
}
