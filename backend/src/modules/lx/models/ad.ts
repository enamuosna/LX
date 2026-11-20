import { model } from "@medusajs/framework/utils"

/** Emplacements publicitaires du site. Chaque emplacement a un format d'image conseillé (voir lib/ads.ts). */
export const AD_SLOTS = ["home_banner", "store_top", "product_side", "cart_bottom"] as const

const Ad = model.define("ad", {
  id: model.id({ prefix: "ad" }).primaryKey(),
  slot: model.text(),
  advertiser: model.text(), // annonceur (visible dans l'admin seulement)
  title: model.text(), // texte alternatif de l'image
  image_url: model.text(),
  link_url: model.text(),
  active: model.boolean().default(true),
  starts_at: model.dateTime().nullable(),
  ends_at: model.dateTime().nullable(),
  priority: model.number().default(0), // plus grand = affiché plus souvent
  impressions: model.number().default(0),
  clicks: model.number().default(0),
})
export default Ad
