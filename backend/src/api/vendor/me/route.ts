import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx, norm, validPhone } from "../../../lib/lx"
import { currentShop } from "../../../lib/vendor"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json({ shop: await currentShop(req) })
}

// La boutique règle ses coordonnées : WhatsApp des commandes, Wave, Orange Money, adresse.
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const shop = await currentShop(req), b = (req.body || {}) as any, data: Record<string, unknown> = { id: shop.id }
  if (b.phone !== undefined) { if (!validPhone(b.phone)) return res.status(400).json({ message: "Numéro WhatsApp invalide." }); data.phone = norm(b.phone) }
  for (const [k, col] of [["wave", "wave_number"], ["om", "om_number"]] as const) {
    if (b[k] === undefined) continue
    if (b[k] && !validPhone(b[k])) return res.status(400).json({ message: `Numéro ${k === "wave" ? "Wave" : "Orange Money"} invalide.` })
    data[col] = b[k] ? norm(b[k]) : null
  }
  if (b.address !== undefined) data.address = String(b.address).slice(0, 255) || null
  if (b.name) data.name = String(b.name).trim().slice(0, 150)
  await lx(req.scope).updateShops(data as any)
  res.json({ shop: await currentShop(req) })
}
