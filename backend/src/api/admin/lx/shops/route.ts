import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lx } from "../../../../lib/lx"
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ shops: await lx(req.scope).listShops({}, { order: { created_at: "DESC" } }) })
}
