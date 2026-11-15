import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import { updateProductsWorkflow, updateInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { defaultCommerceContext } from "../../../../lib/lx"
import { currentShop } from "../../../../lib/vendor"

// Modifier nom / description / prix / stock, ou publier / masquer un produit de SA boutique.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  if (shop.status !== "approved") return res.status(403).json({ message: "Boutique non validée par Lx." })
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [p] } = await query.graph({ entity: "product", fields: ["id", "metadata", "shop.id", "variants.id", "variants.inventory_items.inventory_item_id"], filters: { id: req.params.id } })
  if (!p || (p as any).shop?.id !== shop.id) return res.status(404).json({ message: "Produit introuvable." })
  const b = (req.body || {}) as any
  const update: any = {}
  if (b.name) update.title = String(b.name).slice(0, 160)
  if (b.description !== undefined) update.description = String(b.description).slice(0, 2000)
  if (b.active !== undefined) update.status = b.active ? ProductStatus.PUBLISHED : ProductStatus.DRAFT
  const variant = (p as any).variants?.[0]
  if (b.price !== undefined) {
    const price = Math.round(Number(b.price)); if (!(price > 0)) return res.status(400).json({ message: "Prix invalide." })
    update.variants = [{ id: variant.id, prices: [{ currency_code: "xof", amount: price }] }]
  }
  // Promotion : old_price = ancien prix barré affiché à côté du prix ; null/0 retire la promotion.
  if (b.old_price !== undefined) update.metadata = { ...((p as any).metadata || {}), old_price: Number(b.old_price) > 0 ? Math.round(Number(b.old_price)) : null }
  if (Object.keys(update).length) await updateProductsWorkflow(req.scope).run({ input: { selector: { id: p.id }, update } })
  if (b.stock !== undefined) {
    const ctx = await defaultCommerceContext(req.scope), itemId = variant?.inventory_items?.[0]?.inventory_item_id
    if (itemId && ctx.locationId) await updateInventoryLevelsWorkflow(req.scope).run({ input: { updates: [{ inventory_item_id: itemId, location_id: ctx.locationId, stocked_quantity: Math.max(0, Math.round(Number(b.stock))) }] } })
  }
  res.json({ ok: true })
}
