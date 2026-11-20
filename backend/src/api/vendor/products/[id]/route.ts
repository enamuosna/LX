import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import { deleteProductsWorkflow, updateProductsWorkflow, uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { lx } from "../../../../lib/lx"
import { inventoryItemOf, levelOf, moveStock } from "../../../../lib/stock"
import { currentShop } from "../../../../lib/vendor"

// Modifier nom / description / prix / stock, ou publier / masquer un produit de SA boutique.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  if (shop.status !== "approved") return res.status(403).json({ message: "Boutique non validée par Lx." })
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [p] } = await query.graph({ entity: "product", fields: ["id", "title", "metadata", "shop.id", "variants.id", "variants.inventory_items.inventory_item_id"], filters: { id: req.params.id } })
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
  if (b.sku !== undefined) update.variants = [{ ...(update.variants?.[0] || { id: variant.id }), sku: String(b.sku).trim().slice(0, 60) || null }]
  if (b.category_id !== undefined) update.category_ids = b.category_id ? [String(b.category_id)] : []
  if (b.cost_price !== undefined || b.low_stock !== undefined) {
    const md = { ...((p as any).metadata || {}), ...(update.metadata || {}) }
    if (b.cost_price !== undefined) md.cost_price = Number(b.cost_price) > 0 ? Math.round(Number(b.cost_price)) : null
    if (b.low_stock !== undefined) md.low_stock = Math.max(0, Math.round(Number(b.low_stock) || 0))
    update.metadata = md
  }
  if (b.image_base64) {
    const mime = String(b.image_mime || "")
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) return res.status(400).json({ message: "Format image non supporté (JPG, PNG, WebP)." })
    if (b.image_base64.length > 2.8 * 1024 * 1024) return res.status(400).json({ message: "Image trop lourde (2 Mo max)." })
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[mime]
    const { result } = await uploadFilesWorkflow(req.scope).run({ input: { files: [{ filename: `shop-${Date.now()}.${ext}`, mimeType: mime, content: b.image_base64, access: "public" }] } })
    update.thumbnail = result[0].url; update.images = [{ url: result[0].url }]
  }
  if (Object.keys(update).length) await updateProductsWorkflow(req.scope).run({ input: { selector: { id: p.id }, update } })
  if (b.stock !== undefined) {
    // Correction du stock : passe par le journal d'inventaire pour garder une trace.
    const itemId = await inventoryItemOf(req.scope, p.id), target = Math.max(0, Math.round(Number(b.stock)))
    if (itemId) {
      const cur = (await levelOf(req.scope, itemId)).stocked
      if (target !== cur) try { await moveStock(req.scope, { shopId: shop.id, productId: p.id, title: (p as any).title, delta: target - cur, reason: "adjustment", note: "Correction depuis la fiche produit" }) } catch (e: any) { return res.status(409).json({ message: e.message }) }
    }
  }
  res.json({ ok: true })
}

// Supprimer un produit : refusé tant qu'une commande en cours le contient (on peut le masquer à la place).
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [p] } = await query.graph({ entity: "product", fields: ["id", "shop.id"], filters: { id: req.params.id } })
  if (!p || (p as any).shop?.id !== shop.id) return res.status(404).json({ message: "Produit introuvable." })
  const open = (await lx(req.scope).listShopOrders({ shop_id: shop.id, status: ["pending", "confirmed", "picked_up"] } as any)).some((o: any) => (o.items as any[]).some((i) => i.product_id === p.id))
  if (open) return res.status(409).json({ message: "Des commandes en cours contiennent ce produit. Masquez-le de la vitrine, vous pourrez le supprimer ensuite." })
  await deleteProductsWorkflow(req.scope).run({ input: { ids: [p.id] } })
  res.json({ ok: true })
}
