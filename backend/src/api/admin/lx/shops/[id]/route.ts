import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { lx } from "../../../../../lib/lx"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const status = (req.body as any)?.status
  if (!["approved", "suspended", "pending"].includes(status)) return res.status(400).json({ message: "Statut invalide." })
  const shop = await lx(req.scope).updateShops({ id: req.params.id, status } as any)
  if (status !== "approved") {
    // Une boutique non agréée ne doit plus apparaître en vitrine : ses produits repassent en brouillon.
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({ entity: "product", fields: ["id", "shop.id"] })
    const ids = data.filter((p: any) => p.shop?.id === req.params.id).map((p: any) => p.id)
    if (ids.length) await updateProductsWorkflow(req.scope).run({ input: { selector: { id: ids }, update: { status: ProductStatus.DRAFT } } })
  }
  res.json({ shop })
}
