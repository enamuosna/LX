import { model } from "@medusajs/framework/utils"

// Vente au comptoir (caisse) : le client est dans la boutique, aucune livraison Lx.
const PosSale = model.define("pos_sale", {
  id: model.id({ prefix: "pos" }).primaryKey(),
  shop_id: model.text().index(),
  number: model.number(), // numéro de ticket propre à la boutique
  items: model.json(), // [{ product_id, title, sku, quantity, unit_price, cost }]
  subtotal: model.number(),
  discount: model.number().default(0),
  total: model.number(),
  payment_method: model.enum(["cash", "wave", "om", "card"]),
  amount_received: model.number().nullable(),
  change_given: model.number().default(0),
  customer_name: model.text().nullable(),
  customer_phone: model.text().nullable(),
  note: model.text().nullable(),
  status: model.enum(["completed", "voided"]).default("completed"),
  voided_at: model.dateTime().nullable(),
})
export default PosSale
