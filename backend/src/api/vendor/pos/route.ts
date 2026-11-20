import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { inventoryRow } from "../../../lib/vendor-products"
import { shopProducts } from "../../../lib/vendor-products"

// Articles proposés à la caisse : produits publiés de la boutique avec leur stock disponible.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { products } = await shopProducts(req)
  const items = products.filter((p: any) => p.status === "published").map(inventoryRow).map((i: any) => ({ id: i.id, title: i.title, thumbnail: i.thumbnail, sku: i.sku, category: i.category, price: i.price, available: i.available }))
  res.json({ items })
}
