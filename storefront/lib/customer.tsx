"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { BASE, ApiError } from "./medusa"

const KEY = "lx_customer_token"
export type Customer = { id: string; email: string; first_name?: string; last_name?: string; phone?: string; metadata?: Record<string, any> | null; addresses?: Address[] }
export type Address = { id: string; first_name?: string; last_name?: string; address_1?: string; city?: string; phone?: string; is_default_shipping?: boolean }

export const customerToken = () => { try { return localStorage.getItem(KEY) } catch { return null } }
/** En-têtes d'authentification client (vide pour un visiteur). */
export const customerHeaders = (): Record<string, string> => { const t = customerToken(); return t ? { Authorization: `Bearer ${t}` } : {} }

async function raw(path: string, init: RequestInit = {}) {
  const r = await fetch(`${BASE}${path}`, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", ...customerHeaders(), ...(init.headers || {}) } })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError(j.message || `Erreur ${r.status}`, r.status)
  return j
}
export const customerApi = <T = any,>(path: string, body?: unknown, method?: string): Promise<T> =>
  raw(path, { method: method || (body === undefined ? "GET" : "POST"), body: body === undefined ? undefined : JSON.stringify(body) })

type Ctx = { customer: Customer | null; ready: boolean; login: (email: string, password: string) => Promise<void>; register: (d: { email: string; password: string; first_name: string; last_name: string; phone: string }) => Promise<void>; logout: () => void; refresh: () => Promise<void> }
const C = createContext<Ctx>(null as any)
export const useCustomer = () => useContext(C)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null), [ready, setReady] = useState(false)
  const refresh = useCallback(async () => {
    if (!customerToken()) { setCustomer(null); setReady(true); return }
    try { setCustomer((await customerApi("/store/customers/me?fields=*addresses")).customer) } catch { try { localStorage.removeItem(KEY) } catch {} ; setCustomer(null) }
    setReady(true)
  }, [])
  useEffect(() => { refresh() }, [refresh])

  const login = async (email: string, password: string) => {
    const j = await raw("/auth/customer/emailpass", { method: "POST", body: JSON.stringify({ email, password }), headers: {} }).catch(() => { throw new Error("Email ou mot de passe incorrect.") })
    localStorage.setItem(KEY, j.token); await refresh()
    // Les identifiants d'une boutique passent l'authentification mais n'ont pas de profil client : on l'explique.
    if (!customerToken()) throw new Error("Ce compte n'est pas un compte client. Les boutiques se connectent dans l'espace boutique, ou créez un compte client avec un autre email.")
  }
  const register = async (d: { email: string; password: string; first_name: string; last_name: string; phone: string }) => {
    const t = await raw("/auth/customer/emailpass/register", { method: "POST", body: JSON.stringify({ email: d.email, password: d.password }), headers: {} }).catch((e) => { throw new Error(/exist/i.test(e.message) ? "Un compte existe déjà avec cet email." : e.message) })
    await raw("/store/customers", { method: "POST", body: JSON.stringify({ email: d.email, first_name: d.first_name, last_name: d.last_name, phone: d.phone }), headers: { Authorization: `Bearer ${t.token}` } })
    await login(d.email, d.password)
  }
  const logout = () => { try { localStorage.removeItem(KEY) } catch {} ; setCustomer(null) }
  return <C.Provider value={{ customer, ready, login, register, logout, refresh }}>{children}</C.Provider>
}
