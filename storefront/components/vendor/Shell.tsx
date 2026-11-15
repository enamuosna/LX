"use client"
import { Boxes, Info, LayoutDashboard, LogOut, MessageCircle } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import Banner from "@/components/ui/Banner"
import Logo from "@/components/ui/Logo"
import Skeleton from "@/components/ui/Skeleton"
import { useToast } from "@/components/ui/Toast"
import { cn } from "@/lib/cn"
import { vendorApi, vendorLogout, vendorToken } from "@/lib/vendor"

export const STATUS: Record<string, string> = { pending: "En attente", confirmed: "Confirmée", picked_up: "En route", delivered: "Livrée", rejected: "Refusée", cancelled: "Annulée" }
type Ctx = { shop: any; toast: (msg: string, err?: boolean) => void; pending: number; setPending: (n: number) => void }
const V = createContext<Ctx>(null as any)
export const useVendor = () => useContext(V)

const NAV = [{ href: "/vendor", icon: LayoutDashboard, label: "Tableau de bord" }, { href: "/vendor/products", icon: Boxes, label: "Mes produits" }]
const SHOP_STATUS: Record<string, [string, "orange" | "green" | "red"]> = { pending: ["En attente de validation", "orange"], approved: ["Boutique agréée", "green"], suspended: ["Suspendue", "red"] }

export default function Shell({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const r = useRouter(), path = usePathname(), toast = useToast()
  const [shop, setShop] = useState<any>(null), [pending, setPending] = useState(0)
  useEffect(() => { if (!vendorToken()) { r.replace("/vendor/login"); return } vendorApi("/me").then((d) => setShop(d.shop)).catch(() => r.replace("/vendor/login")) }, [r])
  const logout = () => { vendorLogout(); r.push("/vendor/login") }

  if (!shop) return <div className="min-h-screen bg-surface p-8"><Skeleton className="mb-4 h-20" /><Skeleton className="h-64" /></div>
  const [stLabel, stTone] = SHOP_STATUS[shop.status] ?? [shop.status, "gray" as const]
  const link = (n: (typeof NAV)[number], mobile = false) => (
    <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl text-sm font-semibold transition", mobile ? "whitespace-nowrap px-3 py-2" : "px-3.5 py-2.5", path === n.href ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-white/10")}>
      <n.icon className="size-[18px]" />{n.label}{n.href === "/vendor" && pending > 0 && <span data-testid="pending-count" className="ml-auto rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-extrabold text-ink">{pending}</span>}</Link>)
  return (<V.Provider value={{ shop, toast, pending, setPending }}>
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-night p-5 text-white lg:flex">
        <div className="flex items-end gap-2"><Logo tagline={false} href="/vendor" /><span className="mb-1 text-[11px] leading-tight text-slate-400">Lo Soxla ?<br />Espace boutique</span></div>
        <div className="mt-6 rounded-2xl bg-white/5 p-4"><div className="font-bold">{shop.name}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><MessageCircle className="size-3.5" />+{shop.phone}</div><Badge tone={stTone} className="mt-3">{stLabel}</Badge></div>
        <nav className="mt-6 flex flex-col gap-1">{NAV.map((n) => link(n))}</nav>
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">← Site</Link><button onClick={logout} className="flex items-center gap-1.5 hover:text-white"><LogOut className="size-4" />Déconnexion</button></div></aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 bg-night text-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-3"><Logo tagline={false} href="/vendor" className="[&>span]:text-3xl" /><span className="truncate px-3 text-sm font-semibold">{shop.name}</span>
            <button onClick={logout} aria-label="Déconnexion" className="grid size-9 place-items-center rounded-full hover:bg-white/10"><LogOut className="size-5" /></button></div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">{NAV.map((n) => link(n, true))}</nav></div>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-extrabold">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{actions}</div>
          {shop.status !== "approved" && <Banner tone="warn" title={shop.status === "pending" ? "Votre boutique est en cours de validation." : "Votre boutique est suspendue."} className="mb-6">Vous pourrez traiter des commandes et publier des produits dès qu&apos;elle sera agréée par l&apos;équipe Lx.</Banner>}
          {children}</main></div>
    </div></V.Provider>)
}
