import { model } from "@medusajs/framework/utils"

// Journal d'inventaire : chaque entrée, sortie, correction, comptage ou vente laisse une trace.
const StockMovement = model.define("stock_movement", {
  id: model.id({ prefix: "stk" }).primaryKey(),
  shop_id: model.text().index(),
  product_id: model.text().index(),
  product_title: model.text(),
  reason: model.enum(["initial", "restock", "loss", "adjustment", "count", "sale", "release", "pos_sale", "pos_void"]),
  delta: model.number(), // + entrée, - sortie (0 pour une simple libération de réservation)
  balance_after: model.number(), // stock physique après le mouvement
  note: model.text().nullable(),
  ref: model.text().nullable(), // ex. id de sous-commande
})
export default StockMovement
