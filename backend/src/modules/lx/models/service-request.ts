import { model } from "@medusajs/framework/utils"

// OUTIKO (recherche assistée d'un produit) et JEULIKO (récupération & envoi simple)
const ServiceRequest = model.define("service_request", {
  id: model.id({ prefix: "sreq" }).primaryKey(),
  type: model.enum(["outiko", "jeuliko"]),
  customer_name: model.text(),
  customer_phone: model.text(),
  details: model.text(),
  pickup_address: model.text().nullable(),
  delivery_address: model.text().nullable(),
  status: model.enum(["new", "in_progress", "done", "cancelled"]).default("new"),
})
export default ServiceRequest
