import { MedusaContainer } from "@medusajs/framework/types"
import { lx, waSend, ESCALATE_MINUTES } from "../lib/lx"

// Toutes les 5 min : sous-commandes « pending » sans réponse > 30 min → « relance Lx ».
export default async function escalate(container: MedusaContainer) {
  const svc = lx(container)
  const limit = new Date(Date.now() - ESCALATE_MINUTES * 60_000)
  const late = await svc.listShopOrders({ status: "pending", escalated: false, created_at: { $lt: limit } } as any)
  for (const so of late) {
    await svc.updateShopOrders({ id: so.id, escalated: true } as any)
    if (process.env.LX_WA_NUMBER) await waSend(process.env.LX_WA_NUMBER, `⚠ Commande #${so.order_display_id} sans réponse boutique depuis ${ESCALATE_MINUTES} min.`)
  }
  if (late.length) console.log(`[lx] ${late.length} commande(s) relancée(s)`)
}
export const config = { name: "lx-escalate-shop-orders", schedule: "*/5 * * * *" }
