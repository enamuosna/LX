import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"
import { lx } from "./lx"
import { applyStockEffects } from "./stock"

/** Si toutes les sous-commandes d'une commande sont refusées/annulées, on annule la commande Medusa (libère le stock). */
export async function afterShopOrderChange(container: MedusaContainer, orderId: string) {
  const all = await lx(container).listShopOrders({ order_id: orderId } as any)
  // Inventaire : vente livrée ou réservation libérée, pour chaque sous-commande concernée.
  for (const so of all) await applyStockEffects(container, so.id).catch((e: any) => container.resolve(ContainerRegistrationKeys.LOGGER).warn(`Stock (${so.id}) : ${e.message}`))
  if (all.length && all.every((s: any) => ["rejected", "cancelled"].includes(s.status))) {
    try { await cancelOrderWorkflow(container).run({ input: { order_id: orderId } }) }
    catch (e: any) { container.resolve(ContainerRegistrationKeys.LOGGER).warn(`Annulation Medusa impossible (${orderId}) : ${e.message}`) }
  }
}
