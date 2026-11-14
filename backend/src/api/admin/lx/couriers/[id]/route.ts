import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../../lib/lx"
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.json({ courier: await lx(req.scope).updateCouriers({ id: req.params.id, active: !!(req.body as any)?.active } as any) })
}
