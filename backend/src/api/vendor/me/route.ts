import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { currentShop } from "../../../lib/vendor"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json({ shop: await currentShop(req) })
}
