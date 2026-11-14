import { model } from "@medusajs/framework/utils"
import Shop from "./shop"
import Courier from "./courier"

// Une sous-commande = la part d'une commande Medusa qui revient à une boutique.
const ShopOrder = model.define("shop_order", {
  id: model.id({ prefix: "sord" }).primaryKey(),
  order_id: model.text().index(),
  order_display_id: model.number(),
  status: model
    .enum(["pending", "confirmed", "rejected", "picked_up", "delivered", "cancelled"])
    .default("pending"),
  escalated: model.boolean().default(false), // sans réponse boutique > 30 min : Lx prend le relais
  payment_status: model.enum(["unpaid", "paid"]).default("unpaid"),
  customer_name: model.text(),
  customer_phone: model.text(), // normalisé (chiffres uniquement)
  address: model.text(),
  note: model.text().nullable(),
  items: model.json(), // [{title, quantity, unit_price, product_id}]
  subtotal: model.number(),
  shop: model.belongsTo(() => Shop, { mappedBy: "orders" }),
  courier: model.belongsTo(() => Courier, { mappedBy: "orders" }).nullable(),
})
export default ShopOrder
