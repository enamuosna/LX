import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { inventoryRow, shopProducts } from "../../../lib/vendor-products"

// Inventaire de la boutique : une ligne par produit + totaux (valeur au prix d'achat et au prix de vente).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { products } = await shopProducts(req)
  const items = products.map(inventoryRow).sort((a, b) => a.title.localeCompare(b.title))
  res.json({ items, totals: {
    products: items.length, units: items.reduce((s, i) => s + i.stocked, 0), reserved: items.reduce((s, i) => s + i.reserved, 0),
    value_cost: items.reduce((s, i) => s + i.value_cost, 0), value_retail: items.reduce((s, i) => s + i.value_retail, 0),
    low: items.filter((i) => i.state === "low").length, out: items.filter((i) => i.state === "out").length,
  } })
}
