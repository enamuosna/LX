import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow, createInventoryLevelsWorkflow, uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { LX_MODULE } from "../../../modules/lx"
import { defaultCommerceContext, lx } from "../../../lib/lx"
import { currentShop } from "../../../lib/vendor"
import { shopProducts } from "../../../lib/vendor-products"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { products } = await shopProducts(req)
  res.json({ products })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  if (shop.status !== "approved") return res.status(403).json({ message: "Boutique non validée par Lx." })
  const b = (req.body || {}) as any
  const title = String(b.name || "").trim(), price = Math.round(Number(b.price)), stock = Math.max(0, Math.round(Number(b.stock || 0)))
  if (!title || !(price > 0)) return res.status(400).json({ message: "Nom et prix valides requis." })

  let thumbnail: string | undefined = b.image_url ? String(b.image_url) : undefined
  if (b.image_base64) {
    const mime = String(b.image_mime || "")
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) return res.status(400).json({ message: "Format image non supporté (JPG, PNG, WebP)." })
    if (b.image_base64.length > 2.8 * 1024 * 1024) return res.status(400).json({ message: "Image trop lourde (2 Mo max)." })
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[mime]
    const { result } = await uploadFilesWorkflow(req.scope).run({ input: { files: [{ filename: `shop-${Date.now()}.${ext}`, mimeType: mime, content: b.image_base64, access: "public" }] } })
    thumbnail = result[0].url
  }

  const ctx = await defaultCommerceContext(req.scope)
  const { result } = await createProductsWorkflow(req.scope).run({
    input: { products: [{
      title, description: b.description ? String(b.description).slice(0, 2000) : undefined, status: ProductStatus.PUBLISHED,
      thumbnail, images: thumbnail ? [{ url: thumbnail }] : undefined,
      shipping_profile_id: ctx.shippingProfileId, sales_channels: ctx.salesChannelId ? [{ id: ctx.salesChannelId }] : undefined,
      options: [{ title: "Défaut", values: ["Standard"] }],
      variants: [{ title: "Standard", options: { Défaut: "Standard" }, sku: b.sku ? String(b.sku).trim().slice(0, 60) : undefined, manage_inventory: true, prices: [{ currency_code: "xof", amount: price }] }],
      category_ids: b.category_id ? [String(b.category_id)] : undefined,
      metadata: { shop_id: shop.id, shop_code: shop.code, old_price: b.old_price ? Number(b.old_price) : null, cost_price: b.cost_price ? Math.round(Number(b.cost_price)) : null, low_stock: b.low_stock !== undefined && b.low_stock !== "" ? Math.max(0, Math.round(Number(b.low_stock))) : 3 },
    }] },
  })
  const product = result[0]
  await req.scope.resolve(ContainerRegistrationKeys.LINK).create({ [Modules.PRODUCT]: { product_id: product.id }, [LX_MODULE]: { shop_id: shop.id } })

  if (ctx.locationId) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: [p] } = await query.graph({ entity: "product", fields: ["variants.inventory_items.inventory_item_id"], filters: { id: product.id } })
    const itemId = (p as any)?.variants?.[0]?.inventory_items?.[0]?.inventory_item_id
    if (itemId) await createInventoryLevelsWorkflow(req.scope).run({ input: { inventory_levels: [{ inventory_item_id: itemId, location_id: ctx.locationId, stocked_quantity: stock }] } })
  }
  await lx(req.scope).createStockMovements({ shop_id: shop.id, product_id: product.id, product_title: product.title, reason: "initial", delta: stock, balance_after: stock, note: "Stock de départ" } as any)
  res.status(201).json({ product: { id: product.id, title: product.title } })
}
