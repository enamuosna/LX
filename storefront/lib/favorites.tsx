"use client"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { customerApi, useCustomer } from "./customer"

const KEY = "lx_favs"
type Ctx = { ids: string[]; has: (id: string) => boolean; toggle: (id: string) => void }
const C = createContext<Ctx>(null as any)
export const useFavorites = () => useContext(C)
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] } }

/** Favoris : gardés sur l'appareil, et synchronisés avec le compte client quand il y en a un. */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { customer } = useCustomer(); const [ids, setIds] = useState<string[]>([]); const merged = useRef<string | null>(null)
  useEffect(() => { setIds(read()) }, [])
  const save = useCallback((next: string[]) => {
    setIds(next); try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    if (customer) customerApi("/store/customers/me", { metadata: { ...(customer.metadata || {}), favorites: next } }).catch(() => {})
  }, [customer])
  // À la connexion : on fusionne les favoris du compte avec ceux de l'appareil.
  useEffect(() => {
    if (!customer || merged.current === customer.id) return; merged.current = customer.id
    const remote: string[] = (customer.metadata as any)?.favorites || [], all = [...new Set([...remote, ...read()])]
    setIds(all); try { localStorage.setItem(KEY, JSON.stringify(all)) } catch {}
    if (all.length !== remote.length) customerApi("/store/customers/me", { metadata: { ...(customer.metadata || {}), favorites: all } }).catch(() => {})
  }, [customer])
  return <C.Provider value={{ ids, has: (id) => ids.includes(id), toggle: (id) => save(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]) }}>{children}</C.Provider>
}
