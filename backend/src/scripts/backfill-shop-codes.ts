import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { lx } from "../lib/lx"
import { nextShopCode } from "../lib/shop-code"

// Donne un identifiant public (LX-0001…) aux boutiques qui n'en ont pas, et remplace le nom de boutique
// par cet identifiant dans les fiches produit (le nom ne doit jamais apparaître côté client). Idempotent.
export default async function backfillShopCodes({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER), svc = lx(container)
  const shops = await svc.listShops({}, { order: { created_at: "ASC" } })
  for (const s of shops as any[]) if (!s.code) { s.code = await nextShopCode(container); await svc.updateShops({ id: s.id, code: s.code } as any); logger.info(`Boutique ${s.name} : ${s.code}`) }
  const code = new Map<string, string>(shops.map((s: any) => [s.id, s.code]))
  const product = container.resolve(Modules.PRODUCT)
  const products = await product.listProducts({}, { select: ["id", "metadata"], take: 5000 })
  let n = 0
  for (const p of products as any[]) {
    const m = p.metadata || {}; const c = m.shop_id ? code.get(m.shop_id) : undefined
    if (!c || (m.shop_code === c && !("shop_name" in m))) continue
    const { shop_name, ...rest } = m
    await product.updateProducts(p.id, { metadata: { ...rest, shop_code: c, shop_name: null } } as any); n++
  }
  logger.info(`Identifiants boutique : ${n} produit(s) mis à jour.`)
}
