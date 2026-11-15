"use client"
import { BASE } from "./medusa"
const KEY = "lx_vendor_token"
export const vendorToken = () => { try { return localStorage.getItem(KEY) } catch { return null } }
export const vendorLogout = () => { try { localStorage.removeItem(KEY) } catch {} }

export async function vendorLogin(email: string, password: string) {
  const r = await fetch(`${BASE}/auth/shop/emailpass`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || !j.token) throw new Error("Identifiants incorrects.")
  localStorage.setItem(KEY, j.token)
}
export async function vendorApi<T = any>(path: string, body?: unknown): Promise<T> {
  const t = vendorToken()
  const r = await fetch(`${BASE}/vendor${path}`, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: body === undefined ? undefined : JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (r.status === 401) { vendorLogout(); throw Object.assign(new Error("Session expirée"), { status: 401 }) }
  if (!r.ok) throw new Error(j.message || "Erreur")
  return j
}

/** Télécharge un fichier protégé (export CSV) avec le jeton boutique. */
export async function vendorDownload(path: string, filename: string) {
  const r = await fetch(`${BASE}/vendor${path}`, { headers: { Authorization: `Bearer ${vendorToken()}` } })
  if (!r.ok) throw new Error("Export impossible.")
  const url = URL.createObjectURL(await r.blob()), a = document.createElement("a")
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
