import { model } from "@medusajs/framework/utils"
import ShopOrder from "./shop-order"

const Shop = model.define("shop", {
  id: model.id({ prefix: "shop" }).primaryKey(),
  name: model.text(),
  phone: model.text(), // WhatsApp, format international sans « + »
  email: model.text().nullable(),
  address: model.text().nullable(),
  status: model.enum(["pending", "approved", "suspended"]).default("pending"),
  orders: model.hasMany(() => ShopOrder, { mappedBy: "shop" }),
})
export default Shop
