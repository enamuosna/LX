"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { vendorApi, vendorLogout, vendorToken } from "@/lib/vendor"

export const STATUS: Record<string, string> = { pending: "En attente", confirmed: "Confirmée", picked_up: "En route", delivered: "Livrée", rejected: "Refusée", cancelled: "Annulée" }
type Ctx = { shop: any; toast: (msg: string, err?: boolean) => void; pending: number; setPending: (n: number) => void }
const V = createContext<Ctx>(null as any)
export const useVendor = () => useContext(V)

const NAV: [string, string, string][] = [["/vendor", "fa-tachometer", "Tableau de bord"], ["/vendor/products", "fa-cubes", "Mes produits"]]

export default function Shell({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const r = useRouter(); const path = usePathname()
  const [shop, setShop] = useState<any>(null), [toasts, setToasts] = useState<{ id: number; m: string; err: boolean }[]>([]), [pending, setPending] = useState(0)
  useEffect(() => { if (!vendorToken()) { r.replace("/vendor/login"); return } vendorApi("/me").then((d) => setShop(d.shop)).catch(() => r.replace("/vendor/login")) }, [r])
  const toast = useCallback((m: string, err = false) => { const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, m, err }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500) }, [])
  const logout = () => { vendorLogout(); r.push("/vendor/login") }

  if (!shop) return <div className="vd"><div className="vd-main"><div className="vd-sk" style={{ height: 80, marginBottom: 16 }} /><div className="vd-sk" /></div></div>
  const status = { pending: "En attente de validation", approved: "Boutique agréée", suspended: "Suspendue" }[shop.status as string]
  return (<V.Provider value={{ shop, toast, pending, setPending }}>
    <div className="vd">
      <aside className="vd-side">
        <div className="vd-brand"><b>L<i>x</i></b><small>Lo Soxla ?<br />Espace boutique</small></div>
        <div className="vd-shop"><div className="n">{shop.name}</div><div className="p"><i className="fa fa-whatsapp" /> +{shop.phone}</div>
          <div style={{ marginTop: 10 }}><span className={`vd-badge b-${shop.status}`}>{status}</span></div></div>
        <nav className="vd-nav">{NAV.map(([h, ic, l]) => <Link key={h} href={h} className={path === h ? "on" : ""}><i className={`fa ${ic}`} />{l}{h === "/vendor" && pending > 0 && <span className="cnt">{pending}</span>}</Link>)}</nav>
        <div className="vd-foot"><Link href="/">← Site</Link><button onClick={logout}>Déconnexion</button></div>
      </aside>
      <div className="vd-top"><div className="r1"><b>L<i>x</i></b><span>{shop.name}</span><button onClick={logout} style={{ background: "none", border: "none", color: "#cfd3dc" }}><i className="fa fa-sign-out" /></button></div>
        <nav>{NAV.map(([h, , l]) => <Link key={h} href={h} className={path === h ? "on" : ""}>{l}{h === "/vendor" && pending > 0 ? ` (${pending})` : ""}</Link>)}</nav></div>
      <main className="vd-main">
        <div className="vd-head"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div><div>{actions}</div></div>
        {shop.status !== "approved" && <div className="vd-banner"><i className="fa fa-info-circle" /><div><b>{shop.status === "pending" ? "Votre boutique est en cours de validation." : "Votre boutique est suspendue."}</b><br />Vous pourrez traiter des commandes et publier des produits dès qu&apos;elle sera agréée par l&apos;équipe Lx.</div></div>}
        {children}
      </main>
      <div className="vd-toasts">{toasts.map((t) => <div key={t.id} className={`vd-toast ${t.err ? "err" : ""}`}><i className={`fa ${t.err ? "fa-exclamation-circle" : "fa-check-circle"}`} />{t.m}</div>)}</div>
    </div></V.Provider>)
}
