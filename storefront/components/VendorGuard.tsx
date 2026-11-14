"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { vendorApi, vendorLogout, vendorToken } from "@/lib/vendor"
export default function VendorGuard({ children }: { children: (shop: any) => React.ReactNode }) {
  const r = useRouter(); const [shop, setShop] = useState<any>(null)
  useEffect(() => { if (!vendorToken()) { r.replace("/vendor/login"); return } vendorApi("/me").then((d) => setShop(d.shop)).catch(() => r.replace("/vendor/login")) }, [r])
  if (!shop) return <div className="section"><div className="container">Chargement…</div></div>
  return (<><div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>Espace boutique — {shop.name}</h2>
    <p style={{ margin: "5px 0 0" }}>Statut : <span className={`badge-s badge-${shop.status}`}>{({ pending: "en attente de validation", approved: "agréée", suspended: "suspendue" } as any)[shop.status]}</span> · <Link href="/vendor">Commandes</Link> · <Link href="/vendor/products">Mes produits</Link> · <a href="#" onClick={(e) => { e.preventDefault(); vendorLogout(); r.push("/vendor/login") }}>Déconnexion</a></p></div></div>
    <div className="section"><div className="container">{children(shop)}</div></div></>)
}
