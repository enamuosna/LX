import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { currentShop } from "./vendor"

export const FIELDS = ["id", "title", "description", "status", "thumbnail", "metadata", "categories.id", "categories.name", "variants.id", "variants.sku", "variants.prices.amount", "variants.prices.currency_code",
  "variants.inventory_items.inventory_item_id", "variants.inventory_items.inventory.location_levels.stocked_quantity", "variants.inventory_items.inventory.location_levels.reserved_quantity", "shop.id"]

/** Produits de la boutique connectée, avec stock physique, réservé et disponible. */
export async function shopProducts(req: AuthenticatedMedusaRequest) {
  const shop = await currentShop(req)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "product", fields: FIELDS, filters: { shop: { id: shop.id } } as any })
  return { shop, products: (data as any[]).filter((p) => p.shop?.id === shop.id) }
}
export const levelsOf = (p: any) => {
  const lv = p.variants?.[0]?.inventory_items?.[0]?.inventory?.location_levels?.[0]
  const stocked = Number(lv?.stocked_quantity ?? 0), reserved = Number(lv?.reserved_quantity ?? 0)
  return { stocked, reserved, available: stocked - reserved }
}
export const priceOf = (p: any) => p.variants?.[0]?.prices?.find((x: any) => x.currency_code === "xof")?.amount ?? 0
export const costOf = (p: any) => Number(p.metadata?.cost_price) || 0
export const thresholdOf = (p: any) => (p.metadata?.low_stock !== undefined && p.metadata?.low_stock !== null ? Number(p.metadata.low_stock) : 3)

export function inventoryRow(p: any) {
  const l = levelsOf(p), price = priceOf(p), cost = costOf(p), threshold = thresholdOf(p)
  return { id: p.id, title: p.title, thumbnail: p.thumbnail, status: p.status, sku: p.variants?.[0]?.sku ?? null, category: p.categories?.[0]?.name ?? null,
    price, cost, threshold, ...l, state: l.available <= 0 ? "out" : l.available <= threshold ? "low" : "ok", value_cost: l.stocked * cost, value_retail: l.stocked * price }
}
