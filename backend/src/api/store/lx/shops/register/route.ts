import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { lx, norm, validPhone } from "../../../../../lib/lx"

// Inscription d'une boutique : crée l'identité d'authentification (acteur « shop ») + la boutique (statut pending).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b = (req.body || {}) as any
  const name = String(b.shop || "").trim().slice(0, 150), owner = String(b.owner || "").trim()
  const email = String(b.email || "").trim().toLowerCase(), password = String(b.password || "")
  if (!name || !owner) return res.status(400).json({ message: "Nom de la boutique et du gérant requis." })
  if (!validPhone(b.phone || "")) return res.status(400).json({ message: "Téléphone / WhatsApp invalide." })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ message: "Email invalide." })
  if (password.length < 8) return res.status(400).json({ message: "Mot de passe : 8 caractères minimum." })

  const auth = req.scope.resolve(Modules.AUTH)
  const reg = await auth.register("emailpass", { url: req.url, headers: req.headers as any, query: {}, protocol: req.protocol, body: { email, password } } as any)
  if (!reg.success || !reg.authIdentity) return res.status(409).json({ message: "Un compte existe déjà avec cet email." })

  const shop = await lx(req.scope).createShops({ name, phone: norm(b.phone), email, address: b.address ? String(b.address).slice(0, 255) : null, status: "pending" } as any)
  await auth.updateAuthIdentities({ id: reg.authIdentity.id, app_metadata: { shop_id: shop.id } })
  res.status(201).json({ shop: { id: shop.id, name: shop.name, status: shop.status } })
}
