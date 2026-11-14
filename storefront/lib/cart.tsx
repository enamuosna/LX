"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { getRegionId, post, store } from "./medusa"

export type Cart = { id: string; items: { id: string; title: string; quantity: number; unit_price: number; thumbnail?: string; variant_id: string; subtotal: number; metadata?: any }[]; subtotal: number; shipping_total: number; total: number }
type Ctx = { cart: Cart | null; count: number; busy: boolean; add: (variantId: string, qty?: number) => Promise<void>; setQty: (lineId: string, q: number) => Promise<void>; remove: (lineId: string) => Promise<void>; reload: () => Promise<void>; reset: () => void; setCart: (c: Cart | null) => void }
const C = createContext<Ctx>(null as any)
export const useCart = () => useContext(C)
const KEY = "lx_cart_id"
const FIELDS = "*items,+items.thumbnail,*shipping_methods"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const id = localStorage.getItem(KEY); if (!id) return
      const { cart } = await store(`/store/carts/${id}?fields=${FIELDS}`)
      if (cart.completed_at) { localStorage.removeItem(KEY); return setCart(null) }
      setCart(cart)
    } catch { try { localStorage.removeItem(KEY) } catch {} ; setCart(null) }
  }, [])
  useEffect(() => { load() }, [load])

  const ensure = async (): Promise<string> => {
    let id: string | null = null
    try { id = localStorage.getItem(KEY) } catch {}
    if (id) return id
    const { cart } = await post("/store/carts", { region_id: await getRegionId() })
    try { localStorage.setItem(KEY, cart.id) } catch {}
    return cart.id
  }
  const wrap = async (fn: () => Promise<any>) => { setBusy(true); try { const r = await fn(); await load(); return r } finally { setBusy(false) } }

  const value: Ctx = {
    cart, busy, count: cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
    add: (variantId, qty = 1) => wrap(async () => { const id = await ensure(); await post(`/store/carts/${id}/line-items`, { variant_id: variantId, quantity: qty }) }),
    setQty: (lineId, q) => wrap(async () => { const id = await ensure(); q > 0 ? await post(`/store/carts/${id}/line-items/${lineId}`, { quantity: q }) : await store(`/store/carts/${id}/line-items/${lineId}`, { method: "DELETE" }) }),
    remove: (lineId) => wrap(async () => { const id = await ensure(); await store(`/store/carts/${id}/line-items/${lineId}`, { method: "DELETE" }) }),
    reload: load, setCart,
    reset: () => { try { localStorage.removeItem(KEY) } catch {} ; setCart(null) },
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
