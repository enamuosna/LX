import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx, norm } from "../../../../lib/lx"
import { currentShop } from "../../../../lib/vendor"
import { shopProducts, costOf, levelsOf, priceOf } from "../../../../lib/vendor-products"
import { moveStock } from "../../../../lib/stock"
import { dayBounds, METHODS } from "../../../../lib/pos"

// Historique du jour + clôture de caisse (totaux par moyen de paiement).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req), { day, from, to } = dayBounds(String(req.query.day || ""))
  const all: any[] = await lx(req.scope).listPosSales({ shop_id: shop.id } as any, { order: { created_at: "DESC" }, take: 1500 })
  const sales = all.filter((s) => { const t = new Date(s.created_at); return t >= from && t <= to })
  const done = sales.filter((s) => s.status === "completed")
  const by: Record<string, { count: number; total: number }> = Object.fromEntries(METHODS.map((m) => [m, { count: 0, total: 0 }]))
  let total = 0, discount = 0, units = 0
  for (const s of done) { by[s.payment_method].count++; by[s.payment_method].total += s.total; total += s.total; discount += s.discount; units += (s.items as any[]).reduce((n, i) => n + i.quantity, 0) }
  res.json({ day, sales, summary: { count: done.length, voided: sales.length - done.length, total, discount, units, by } })
}

// Encaissement : contrôle du stock disponible, baisse immédiate du stock physique, ticket numéroté.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req)
  if (shop.status !== "approved") return res.status(403).json({ message: "Boutique non validée par Lx." })
  const b = (req.body || {}) as any
  if (!METHODS.includes(b.payment_method)) return res.status(400).json({ message: "Moyen de paiement invalide." })
  const lines = Array.isArray(b.items) ? b.items : []
  if (!lines.length || lines.length > 100) return res.status(400).json({ message: "Le panier est vide." })
  const { products } = await shopProducts(req), items: any[] = []
  for (const l of lines) {
    const p = products.find((x: any) => x.id === l.product_id), qty = Math.round(Number(l.quantity))
    if (!p || p.status !== "published") return res.status(404).json({ message: "Un produit du panier n'est plus disponible." })
    if (!(qty > 0)) return res.status(400).json({ message: "Quantité invalide." })
    const dup = items.find((i) => i.product_id === p.id); const want = (dup?.quantity ?? 0) + qty
    if (want > levelsOf(p).available) return res.status(409).json({ message: `Stock insuffisant pour « ${p.title} » : ${levelsOf(p).available} disponible(s).` })
    if (dup) dup.quantity = want
    else items.push({ product_id: p.id, title: p.title, sku: p.variants?.[0]?.sku ?? null, quantity: qty, unit_price: priceOf(p), cost: costOf(p) })
  }
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const discount = Math.min(subtotal, Math.max(0, Math.round(Number(b.discount) || 0))), total = subtotal - discount
  let received: number | null = null, change = 0
  if (b.payment_method === "cash") {
    received = Math.round(Number(b.amount_received ?? total))
    if (!(received >= total)) return res.status(400).json({ message: "Le montant reçu est inférieur au total." })
    change = received - total
  }
  const svc = lx(req.scope), prev: any[] = await svc.listPosSales({ shop_id: shop.id } as any, { order: { number: "DESC" }, take: 1 })
  const number = (prev[0]?.number ?? 0) + 1
  const sale: any = await svc.createPosSales({ shop_id: shop.id, number, items, subtotal, discount, total, payment_method: b.payment_method, amount_received: received, change_given: change,
    customer_name: b.customer_name ? String(b.customer_name).slice(0, 80) : null, customer_phone: b.customer_phone ? norm(String(b.customer_phone)) : null, note: b.note ? String(b.note).slice(0, 300) : null } as any)
  const done: typeof items = []
  try { for (const i of items) { await moveStock(req.scope, { shopId: shop.id, productId: i.product_id, title: i.title, delta: -i.quantity, reason: "pos_sale", ref: sale.id, note: `Caisse, ticket ${number}` }); done.push(i) } }
  catch (e: any) {
    for (const i of done) await moveStock(req.scope, { shopId: shop.id, productId: i.product_id, title: i.title, delta: i.quantity, reason: "pos_void", ref: sale.id, note: `Annulation automatique, ticket ${number}` }).catch(() => {})
    await svc.deletePosSales(sale.id)
    return res.status(409).json({ message: e.message })
  }
  res.status(201).json({ sale })
}
