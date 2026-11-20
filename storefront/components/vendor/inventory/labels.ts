import type { Tone } from "@/components/ui/Badge"
export const REASON: Record<string, { label: string; tone: Tone }> = {
  initial: { label: "Stock de départ", tone: "gray" }, restock: { label: "Entrée", tone: "green" }, loss: { label: "Perte ou casse", tone: "red" },
  adjustment: { label: "Correction", tone: "orange" }, count: { label: "Inventaire", tone: "blue" }, sale: { label: "Vente livrée", tone: "dark" }, pos_sale: { label: "Vente en caisse", tone: "dark" }, pos_void: { label: "Vente annulée", tone: "gray" }, release: { label: "Réservation libérée", tone: "gray" },
}
export type Item = { id: string; title: string; thumbnail: string | null; status: string; sku: string | null; category: string | null; price: number; cost: number; threshold: number; stocked: number; reserved: number; available: number; state: "ok" | "low" | "out"; value_cost: number; value_retail: number }
export type Movement = { id: string; product_id: string; product_title: string; reason: string; delta: number; balance_after: number; note: string | null; created_at: string }
