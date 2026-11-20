import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../../../lib/lx"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = lx(req.scope), [a] = await svc.listAds({ id: req.params.id } as any)
  if (a) await svc.updateAds({ id: a.id, clicks: Number(a.clicks) + 1 } as any)
  res.json({ ok: true })
}
