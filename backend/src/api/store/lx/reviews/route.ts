import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx, norm } from "../../../../lib/lx"

// GET ?product_id=… : avis d'un produit.  GET ?ids=a,b,c : moyenne et nombre d'avis par produit.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = lx(req.scope)
  const ids = String(req.query.ids || req.query.product_id || "").split(",").filter(Boolean).slice(0, 60)
  if (!ids.length) return res.status(400).json({ message: "product_id requis." })
  const rows = await svc.listReviews({ product_id: ids } as any, { order: { created_at: "DESC" }, take: 500 })
  const summary: Record<string, { avg: number; count: number }> = {}
  for (const id of ids) { const r = rows.filter((x: any) => x.product_id === id); summary[id] = { count: r.length, avg: r.length ? Math.round((r.reduce((s: number, x: any) => s + x.rating, 0) / r.length) * 10) / 10 : 0 } }
  res.json({ summary, reviews: req.query.product_id ? rows.slice(0, 30).map((r: any) => ({ id: r.id, author: r.author, rating: r.rating, comment: r.comment, created_at: r.created_at })) : undefined })
}

// POST : le client prouve sa commande (n° + téléphone) ; seul un produit d'une commande livrée peut être noté, une fois.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = lx(req.scope), b = (req.body || {}) as any
  const ref = Number(String(b.ref || "").replace(/\D/g, "")), phone = norm(String(b.phone || "")), rating = Math.round(Number(b.rating))
  if (!ref || !phone || !b.product_id) return res.status(400).json({ message: "Commande, téléphone et produit requis." })
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: "Note de 1 à 5 requise." })
  const orders = await svc.listShopOrders({ order_display_id: ref, customer_phone: phone, status: "delivered" } as any)
  const so: any = orders.find((o: any) => (o.items as any[]).some((i) => i.product_id === b.product_id))
  if (!so) return res.status(403).json({ message: "Vous pouvez noter un produit uniquement après sa livraison." })
  if ((await svc.listReviews({ product_id: b.product_id, order_display_id: ref } as any)).length) return res.status(409).json({ message: "Vous avez déjà noté ce produit pour cette commande." })
  const r = await svc.createReviews({ product_id: b.product_id, order_display_id: ref, author: String(so.customer_name).split(" ")[0] || "Client", rating, comment: b.comment ? String(b.comment).slice(0, 600) : null } as any)
  res.status(201).json({ review: r })
}
