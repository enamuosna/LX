import { model } from "@medusajs/framework/utils"
import ShopOrder from "./shop-order"

const Courier = model.define("courier", {
  id: model.id({ prefix: "cour" }).primaryKey(),
  name: model.text(),
  phone: model.text(),
  active: model.boolean().default(true),
  orders: model.hasMany(() => ShopOrder, { mappedBy: "courier" }),
})
export default Courier
