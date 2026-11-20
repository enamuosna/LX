import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { currentShop } from "../../../../lib/vendor"
import { shopProducts } from "../../../../lib/vendor-products"
import { inventoryItemOf, levelOf, moveStock } from "../../../../lib/stock"

// Comptage d'inventaire : la boutique saisit ce qu'elle a réellement en rayon ; seuls les écarts sont enregistrés.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  if (shop.status !== "approved") return res.status(403).json({ message: "Boutique non validée par Lx." })
  const counts: { product_id: string; counted: number }[] = Array.isArray((req.body as any)?.counts) ? (req.body as any).counts : []
  const label = `Comptage du ${new Date().toLocaleDateString("fr-FR")}`
  const { products } = await shopProducts(req); const applied: { product_id: string; delta: number }[] = [], errors: string[] = []
  for (const c of counts) {
    const p = products.find((x) => x.id === c.product_id), counted = Math.round(Number(c.counted))
    if (!p || !(counted >= 0)) continue
    try {
      const cur = (await levelOf(req.scope, (await inventoryItemOf(req.scope, p.id))!)).stocked
      if (counted === cur) continue
      await moveStock(req.scope, { shopId: shop.id, productId: p.id, title: p.title, delta: counted - cur, reason: "count", note: label })
      applied.push({ product_id: p.id, delta: counted - cur })
    } catch (e: any) { errors.push(`${p.title} : ${e.message}`) }
  }
  res.json({ applied: applied.length, errors })
}
