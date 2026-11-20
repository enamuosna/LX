import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { inventoryRow, shopProducts } from "../../../../lib/vendor-products"

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
const STATE: Record<string, string> = { ok: "OK", low: "Stock faible", out: "Rupture" }
// Export CSV de l'inventaire (ouvrable dans Excel).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { products } = await shopProducts(req), rows = products.map(inventoryRow)
  const head = ["Produit", "SKU", "Catégorie", "Prix de vente", "Prix d'achat", "Stock physique", "Réservé", "Disponible", "Seuil d'alerte", "État", "Valeur au prix d'achat", "Valeur au prix de vente"]
  const lines = rows.map((r) => [r.title, r.sku, r.category, r.price, r.cost, r.stocked, r.reserved, r.available, r.threshold, STATE[r.state], r.value_cost, r.value_retail].map(esc).join(";"))
  res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename="inventaire-lx.csv"`)
  res.send("﻿" + [head.map(esc).join(";"), ...lines].join("\r\n"))
}
