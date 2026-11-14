import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx, norm, validPhone } from "../../../../lib/lx"
export async function GET(req: MedusaRequest, res: MedusaResponse) { res.json({ couriers: await lx(req.scope).listCouriers() }) }
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b = (req.body || {}) as any
  if (!b.name || !validPhone(b.phone || "")) return res.status(400).json({ message: "Nom et téléphone valides requis." })
  res.status(201).json({ courier: await lx(req.scope).createCouriers({ name: String(b.name).slice(0, 120), phone: norm(b.phone) } as any) })
}
