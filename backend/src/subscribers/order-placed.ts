import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { lx, norm, waSend, shopAlertText } from "../lib/lx"

// À chaque commande Medusa : créer une sous-commande par boutique et alerter chaque boutique.
export default async function orderPlaced({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const svc = lx(container)

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "metadata", "items.title", "items.quantity", "items.unit_price", "items.product_id", "shipping_address.*"],
    filters: { id: data.id },
  })
  if (!order) return
  if ((await svc.listShopOrders({ order_id: order.id })).length) return // idempotent

  const productIds = [...new Set((order.items ?? []).map((i: any) => i.product_id).filter(Boolean))]
  const { data: products } = await query.graph({ entity: "product", fields: ["id", "shop.id"], filters: { id: productIds as string[] } })
  const shopOf = new Map<string, string>(products.map((p: any) => [p.id, p.shop?.id]))

  const byShop = new Map<string, any[]>()
  for (const it of (order.items ?? []) as any[]) {
    const sid = shopOf.get(it.product_id)
    if (!sid) { logger.warn(`Article « ${it.title} » sans boutique (commande #${order.display_id})`); continue }
    byShop.set(sid, [...(byShop.get(sid) || []), { title: it.title, quantity: it.quantity, unit_price: Number(it.unit_price), product_id: it.product_id }])
  }

  const a: any = order.shipping_address || {}
  for (const [shopId, items] of byShop) {
    const so = await svc.createShopOrders({
      order_id: order.id,
      order_display_id: order.display_id,
      shop_id: shopId,
      customer_name: `${a.first_name || ""} ${a.last_name || ""}`.trim() || "Client",
      customer_phone: norm(a.phone || ""),
      address: [a.address_1, a.city].filter(Boolean).join(", "),
      note: (order.metadata as any)?.note ?? null,
      delivery_code: String(Math.floor(1000 + Math.random() * 9000)),
      payment_method: (order.metadata as any)?.payment_pref ?? "cod",
      payment_ref: (order.metadata as any)?.payment_refs?.[shopId] ?? (order.metadata as any)?.payment_ref ?? null,
      items,
      subtotal: items.reduce((s, i) => s + i.quantity * i.unit_price, 0),
    } as any)
    const shop = await svc.retrieveShop(shopId)
    if (await waSend(shop.phone, shopAlertText(so))) logger.info(`WhatsApp envoyé à ${shop.name}`)
  }
}
export const config: SubscriberConfig = { event: "order.placed" }
