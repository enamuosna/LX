import { MedusaService } from "@medusajs/framework/utils"
import Shop from "./models/shop"
import Courier from "./models/courier"
import ShopOrder from "./models/shop-order"
import ServiceRequest from "./models/service-request"
import Review from "./models/review"

export const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["picked_up", "cancelled"],
  picked_up: ["delivered"],
  rejected: [],
  delivered: [],
  cancelled: [],
}

class LxModuleService extends MedusaService({ Shop, Courier, ShopOrder, ServiceRequest, Review }) {
  /** Change le statut d'une sous-commande en respectant les transitions autorisées. */
  async transition(id: string, next: string) {
    const so = await this.retrieveShopOrder(id)
    if (!TRANSITIONS[so.status]?.includes(next)) {
      throw new Error(`Transition ${so.status} → ${next} non autorisée`)
    }
    const data: Record<string, unknown> = { id, status: next }
    if (next === "delivered" && so.payment_status === "unpaid") data.payment_status = "paid"
    return await this.updateShopOrders(data as any)
  }
}
export default LxModuleService
