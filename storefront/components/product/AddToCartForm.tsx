"use client"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Button from "@/components/ui/Button"
import { useCart } from "@/lib/cart"

export function QtyStepper({ value, onChange, min = 1, max = 99, disabled }: { value: number; onChange: (n: number) => void; min?: number; max?: number; disabled?: boolean }) {
  const b = "grid size-9 place-items-center text-slate-600 hover:bg-surface disabled:opacity-40"
  return (<div className="inline-flex items-center overflow-hidden rounded-xl border border-line">
    <button type="button" aria-label="Diminuer" className={b} disabled={disabled || value <= min} onClick={() => onChange(value - 1)}><Minus className="size-4" /></button>
    <span data-testid="qty" className="w-10 text-center text-sm font-bold">{value}</span>
    <button type="button" aria-label="Augmenter" className={b} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}><Plus className="size-4" /></button></div>)
}

export default function AddToCartForm({ variantId, max }: { variantId: string; max: number }) {
  const { add, busy } = useCart(); const [q, setQ] = useState(1); const r = useRouter()
  return (<div className="flex flex-wrap items-center gap-3">
    <QtyStepper value={q} onChange={setQ} max={max} />
    <Button size="lg" loading={busy} data-testid="add-to-cart" onClick={async () => { await add(variantId, q); r.push("/cart") }}><ShoppingCart className="size-5" />Commander avec Lx</Button></div>)
}
