import { model } from "@medusajs/framework/utils"

// Avis client : un seul par produit et par commande livrée.
const Review = model.define("review", {
  id: model.id({ prefix: "rev" }).primaryKey(),
  product_id: model.text().index(),
  order_display_id: model.number(),
  author: model.text(),
  rating: model.number(), // 1 à 5
  comment: model.text().nullable(),
})
export default Review
