import { lx } from "./lx"

/** Prochain identifiant public de boutique : LX-0001, LX-0002… */
export async function nextShopCode(container: any): Promise<string> {
  const shops = await lx(container).listShops({}, { select: ["id", "code"] })
  const max = shops.reduce((m: number, s: any) => Math.max(m, Number(/^LX-(\d+)$/.exec(s.code || "")?.[1] || 0)), 0)
  return `LX-${String(max + 1).padStart(4, "0")}`
}
