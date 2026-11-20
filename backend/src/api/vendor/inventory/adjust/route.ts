import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { currentShop } from "../../../../lib/vendor"
import { shopProducts } from "../../../../lib/vendor-products"
import { inventoryItemOf, levelOf, moveStock, Reason } from "../../../../lib/stock"

// Mouvement manuel : entrée (réapprovisionnement), sortie (casse, perte, usage perso) ou correction à une quantité.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  if (shop.status !== "approved") return res.status(403).json({ message: "Boutique non validée par Lx." })
  const b = (req.body || {}) as any, qty = Math.round(Number(b.quantity))
  const { products } = await shopProducts(req), p = products.find((x) => x.id === b.product_id)
  if (!p) return res.status(404).json({ message: "Produit introuvable." })
  if (!(qty >= 0) || (b.mode !== "set" && qty === 0)) return res.status(400).json({ message: "Quantité invalide." })
  try {
    const itemId = await inventoryItemOf(req.scope, p.id), cur = (await levelOf(req.scope, itemId!)).stocked
    const [delta, reason]: [number, Reason] = b.mode === "add" ? [qty, "restock"] : b.mode === "remove" ? [-qty, b.reason === "loss" ? "loss" : "adjustment"] : [qty - cur, "adjustment"]
    const balance = await moveStock(req.scope, { shopId: shop.id, productId: p.id, title: p.title, delta, reason, note: b.note ? String(b.note).slice(0, 300) : null })
    res.json({ ok: true, stocked: balance })
  } catch (e: any) { res.status(409).json({ message: e.message }) }
}
