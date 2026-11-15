import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx, norm, validPhone } from "../../../../lib/lx"

// OUTIKO / JEULIKO : demande publique du client.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b = (req.body || {}) as any
  const type = b.type === "jeuliko" ? "jeuliko" : "outiko"
  const name = String(b.name || "").trim(), details = String(b.details || "").trim()
  if (!name) return res.status(400).json({ message: "Nom requis." })
  if (!validPhone(b.phone || "")) return res.status(400).json({ message: "Téléphone invalide." })
  if (!details) return res.status(400).json({ message: "Décrivez votre demande." })
  if (type === "jeuliko" && (!b.pickup || !b.delivery)) return res.status(400).json({ message: "Adresses de récupération et de livraison requises." })
  const r = await lx(req.scope).createServiceRequests({
    type, customer_name: name.slice(0, 120), customer_phone: norm(b.phone), details: details.slice(0, 2000),
    pickup_address: b.pickup ? String(b.pickup).slice(0, 255) : null, delivery_address: b.delivery ? String(b.delivery).slice(0, 255) : null,
  } as any)
  res.status(201).json({ id: r.id })
}
