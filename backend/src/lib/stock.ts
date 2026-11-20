import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { defaultCommerceContext, lx } from "./lx"

export type Reason = "initial" | "restock" | "loss" | "adjustment" | "count" | "sale" | "release" | "pos_sale" | "pos_void"

/** Identifiant d'article d'inventaire (variante par défaut) d'un produit. */
export async function inventoryItemOf(container: MedusaContainer, productId: string): Promise<string | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [p] } = await query.graph({ entity: "product", fields: ["variants.inventory_items.inventory_item_id"], filters: { id: productId } })
  return (p as any)?.variants?.[0]?.inventory_items?.[0]?.inventory_item_id ?? null
}

/** Niveaux de stock : physique (stocked), réservé par des commandes en cours, disponible à la vente. */
export async function levelOf(container: MedusaContainer, itemId: string) {
  const ctx = await defaultCommerceContext(container)
  const inv = container.resolve(Modules.INVENTORY) as any
  const [lv] = await inv.listInventoryLevels({ inventory_item_id: itemId, location_id: ctx.locationId })
  const stocked = Number(lv?.stocked_quantity ?? 0), reserved = Number(lv?.reserved_quantity ?? 0)
  return { stocked, reserved, available: stocked - reserved, locationId: ctx.locationId as string }
}

/** Applique un mouvement de stock physique (delta) et l'inscrit au journal. Retourne le nouveau stock. */
export async function moveStock(container: MedusaContainer, a: { shopId: string; productId: string; title: string; delta: number; reason: Reason; note?: string | null; ref?: string | null }) {
  const itemId = await inventoryItemOf(container, a.productId)
  if (!itemId) throw new Error("Produit sans article d'inventaire.")
  const inv = container.resolve(Modules.INVENTORY) as any
  const before = await levelOf(container, itemId)
  if (a.delta !== 0) {
    if (before.stocked + a.delta < 0) throw new Error("Le stock ne peut pas être négatif.")
    if (before.stocked + a.delta < before.reserved && a.delta < 0 && a.reason !== "sale") throw new Error(`${before.reserved} unité(s) sont réservées par des commandes en cours : le stock ne peut pas descendre en dessous.`)
    await inv.adjustInventory(itemId, before.locationId, a.delta)
  }
  const balance = before.stocked + a.delta
  await lx(container).createStockMovements({ shop_id: a.shopId, product_id: a.productId, product_title: a.title, reason: a.reason, delta: a.delta, balance_after: balance, note: a.note ?? null, ref: a.ref ?? null } as any)
  return balance
}

/**
 * Effets d'un changement de statut sur le stock :
 * livrée  -> le colis a quitté la boutique : stock physique -qté et réservation soldée ;
 * refusée / annulée -> les unités réservées sont libérées.
 * Idempotent : une sous-commande n'est traitée qu'une fois.
 */
export async function applyStockEffects(container: MedusaContainer, shopOrderId: string) {
  const svc = lx(container), so: any = await svc.retrieveShopOrder(shopOrderId)
  const kind = so.status === "delivered" ? "sale" : ["rejected", "cancelled"].includes(so.status) ? "release" : null
  if (!kind) return
  if ((await svc.listStockMovements({ ref: so.id, reason: kind } as any)).length) return
  const query = container.resolve(ContainerRegistrationKeys.QUERY), inv = container.resolve(Modules.INVENTORY) as any
  const { data: [order] } = await query.graph({ entity: "order", fields: ["items.id", "items.product_id"], filters: { id: so.order_id } })
  for (const it of so.items as any[]) {
    const line = (order?.items ?? []).find((l: any) => l.product_id === it.product_id)
    if (line) await inv.deleteReservationItemsByLineItem(line.id).catch(() => {})
    if (kind === "sale") await moveStock(container, { shopId: so.shop_id, productId: it.product_id, title: it.title, delta: -it.quantity, reason: "sale", ref: so.id, note: `Commande #${so.order_display_id}` }).catch(() => {})
    else {
      const itemId = await inventoryItemOf(container, it.product_id), lv = itemId ? await levelOf(container, itemId) : { stocked: 0 }
      await svc.createStockMovements({ shop_id: so.shop_id, product_id: it.product_id, product_title: it.title, reason: "release", delta: 0, balance_after: lv.stocked, note: `Commande #${so.order_display_id} ${so.status === "rejected" ? "refusée" : "annulée"} : ${it.quantity} unité(s) remises en vente`, ref: so.id } as any)
    }
  }
}
