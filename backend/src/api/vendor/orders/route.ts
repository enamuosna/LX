import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../lib/lx"
import { currentShop } from "../../../lib/vendor"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  const rows = await lx(req.scope).listShopOrders({ shop_id: shop.id } as any, { order: { created_at: "DESC" }, take: 100 })
  rows.sort((a: any, b: any) => Number(b.status === "pending") - Number(a.status === "pending"))
  // Le téléphone et l'adresse du client ne sont utiles au vendeur qu'une fois la commande confirmée.
  res.json({ orders: rows.map((o: any) => ({ ...o, customer_phone: o.status === "pending" ? undefined : o.customer_phone })) })
}
