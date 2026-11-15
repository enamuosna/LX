"use client"
import { Mail, MapPin, Menu, Phone, Search, ShoppingCart, Store, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Container from "@/components/ui/Container"
import Logo from "@/components/ui/Logo"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/cn"

const NAV: [string, string][] = [["/", "Accueil"], ["/#services", "Services"], ["/store", "Boutiques & produits"], ["/#commande", "Comment ça marche"], ["/outiko", "OUTIKO / JEULIKO"], ["/register-shop", "Devenir boutique agréée"], ["/track", "Suivre ma commande"]]

export default function Header({ phone, email }: { phone: string; email: string }) {
  const { count } = useCart(); const router = useRouter(); const path = usePathname()
  const [q, setQ] = useState(""), [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [path])
  const search = (e: React.FormEvent) => { e.preventDefault(); router.push(`/store?q=${encodeURIComponent(q)}`) }
  return (<header className="sticky top-0 z-40 shadow-sm">
    <div className="hidden bg-night text-[13px] text-slate-300 md:block"><Container className="flex h-9 items-center justify-between">
      <div className="flex items-center gap-5">
        <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex items-center gap-1.5 hover:text-white"><Phone className="size-3.5 text-accent-500" />{phone}</a>
        <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-white"><Mail className="size-3.5 text-accent-500" />{email}</a>
        <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-accent-500" />Dakar, Sénégal</span></div>
      <Link href="/vendor" className="flex items-center gap-1.5 hover:text-white"><Store className="size-3.5 text-accent-500" />Espace boutique</Link></Container></div>

    <div className="bg-night"><Container className="flex items-center gap-4 py-3.5">
      <Logo />
      <form onSubmit={search} className="mx-auto hidden w-full max-w-xl md:flex" role="search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qu'avez-vous besoin ?" aria-label="Rechercher un produit" className="min-w-0 flex-1 rounded-l-full border-0 bg-white px-5 py-2.5 text-sm outline-none focus:ring-4 focus:ring-accent-500/40" />
        <button className="flex items-center gap-2 rounded-r-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-500"><Search className="size-4" />Chercher</button></form>
      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <Link href="/cart" data-testid="cart-link" className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
          <ShoppingCart className="size-5" /><span className="hidden sm:inline">Ma commande</span>
          {count > 0 && <span data-testid="cart-count" className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent-500 text-[11px] font-extrabold text-ink">{count}</span>}</Link>
        <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-xl text-white hover:bg-white/10 lg:hidden">{open ? <X /> : <Menu />}</button></div>
    </Container>
      <form onSubmit={search} className="px-4 pb-3 md:hidden" role="search"><div className="flex"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qu'avez-vous besoin ?" aria-label="Rechercher un produit" className="min-w-0 flex-1 rounded-l-full bg-white px-4 py-2.5 text-sm outline-none" />
        <button aria-label="Chercher" className="rounded-r-full bg-brand-600 px-4 text-white"><Search className="size-4" /></button></div></form></div>

    <nav className={cn("border-b border-line bg-white", open ? "block" : "hidden lg:block")} aria-label="Navigation principale"><Container>
      <ul className="flex flex-col py-2 lg:flex-row lg:items-center lg:gap-1 lg:py-0">
        {NAV.map(([h, l]) => <li key={h}><Link href={h} className={cn("block rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:text-brand-600 lg:rounded-none lg:py-3.5", path === h ? "text-brand-600" : "text-slate-700")}>{l}</Link></li>)}
      </ul></Container></nav>
  </header>)
}
