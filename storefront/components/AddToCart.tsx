"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCart } from "@/lib/cart"
export default function AddToCart({ variantId, max }: { variantId: string; max: number }) {
  const { add, busy } = useCart(); const [q, setQ] = useState(1); const r = useRouter()
  return (<div className="form-inline">
    <input type="number" min={1} max={max} value={q} onChange={(e) => setQ(Math.max(1, Math.min(max, Number(e.target.value) || 1)))} className="input" style={{ width: 80, display: "inline-block" }} />{" "}
    <button className="primary-btn" disabled={busy} style={{ borderRadius: 40 }} onClick={async () => { await add(variantId, q); r.push("/cart") }}>Commander avec Lx</button></div>)
}
