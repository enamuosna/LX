import { model } from "@medusajs/framework/utils"
import ShopOrder from "./shop-order"

const Shop = model.define("shop", {
  id: model.id({ prefix: "shop" }).primaryKey(),
  code: model.text().nullable(), // identifiant public (LX-0001) : seul celui-ci est montré aux clients
  name: model.text(),
  phone: model.text(), // WhatsApp, format international sans « + »
  email: model.text().nullable(),
  wave_number: model.text().nullable(), // numéro Wave de la boutique (paiements clients)
  om_number: model.text().nullable(), // numéro Orange Money de la boutique
  address: model.text().nullable(),
  status: model.enum(["pending", "approved", "suspended"]).default("pending"),
  orders: model.hasMany(() => ShopOrder, { mappedBy: "shop" }),
})
export default Shop
