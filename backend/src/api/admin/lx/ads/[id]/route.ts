import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { cleanAd } from "../../../../../lib/ads"
import { lx } from "../../../../../lib/lx"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try { res.json({ ad: await lx(req.scope).updateAds({ id: req.params.id, ...cleanAd((req.body || {}) as any) } as any) }) } catch (e: any) { res.status(400).json({ message: e.message }) }
}
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await lx(req.scope).deleteAds(req.params.id); res.json({ ok: true })
}
