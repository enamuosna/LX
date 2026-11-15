"use client"
import { Menu, Search, ShoppingBag, User, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Container from "@/components/ui/Container"
import Logo from "@/components/ui/Logo"
import { useCart } from "@/lib/cart"
import { useCustomer } from "@/lib/customer"
import { cn } from "@/lib/cn"

const NAV: [string, string][] = [["/store", "Produits"], ["/outiko", "OUTIKO et JEULIKO"], ["/#commande", "Comment ça marche"], ["/track", "Suivre ma commande"], ["/register-shop", "Vendre sur Lx"]]

export default function Header({ phone }: { phone: string; email: string }) {
  const { count } = useCart(); const { customer } = useCustomer(); const router = useRouter(); const path = usePathname()
  const [q, setQ] = useState(""), [open, setOpen] = useState(false), [scrolled, setScrolled] = useState(false), [bump, setBump] = useState(0)
  useEffect(() => setOpen(false), [path])
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f) }, [])
  useEffect(() => { if (count) setBump((b) => b + 1) }, [count])
  const search = (e: React.FormEvent) => { e.preventDefault(); router.push(`/store?q=${encodeURIComponent(q)}`) }
  return (<header className={cn("sticky top-0 z-40 border-b transition-all duration-300", scrolled ? "border-line bg-white/85 shadow-[0_6px_24px_-12px_rgba(16,35,26,0.25)] backdrop-blur-xl" : "border-transparent bg-white")}>
    <Container className="flex h-[72px] items-center gap-4">
      <Logo />
      <nav className="ml-6 hidden items-center gap-1 xl:flex" aria-label="Navigation principale">{NAV.map(([h, l]) => (
        <Link key={h} href={h} className={cn("group relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors hover:text-brand-600", path === h ? "text-brand-600" : "text-slate-600")}>{l}
          <span className={cn("absolute inset-x-3.5 bottom-0.5 h-0.5 origin-left rounded bg-accent-500 transition-transform duration-300", path === h ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} /></Link>))}</nav>
      <form onSubmit={search} role="search" className="group ml-auto hidden w-64 items-center gap-2 rounded-full bg-surface px-4 py-2.5 ring-2 ring-transparent transition-all duration-300 focus-within:w-80 focus-within:bg-white focus-within:ring-brand-600 md:flex">
        <Search className="size-4 shrink-0 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Que cherchez-vous ?" aria-label="Rechercher un produit" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" /></form>
      <Link href="/account" data-testid="account-link" aria-label={customer ? "Mon compte" : "Se connecter"} className="ml-auto grid size-11 place-items-center rounded-full bg-surface font-bold transition hover:bg-brand-50 hover:text-brand-600 active:scale-95 md:ml-0">{customer ? <span className="font-display text-lg">{(customer.first_name || customer.email)[0].toUpperCase()}</span> : <User className="size-5" />}</Link>
      <Link href="/cart" data-testid="cart-link" aria-label="Ma commande" className="relative grid size-11 place-items-center rounded-full bg-ink text-white transition hover:bg-brand-600 active:scale-95">
        <ShoppingBag className="size-5" />{count > 0 && <span key={bump} data-testid="cart-count" className="absolute -right-1 -top-1 grid size-5 animate-bump place-items-center rounded-full bg-accent-500 text-[11px] font-extrabold text-ink">{count}</span>}</Link>
      <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="grid size-11 place-items-center rounded-full bg-surface xl:hidden"><span className="relative size-5"><Menu className={cn("absolute inset-0 transition duration-300", open && "rotate-90 scale-0 opacity-0")} /><X className={cn("absolute inset-0 transition duration-300", !open && "-rotate-90 scale-0 opacity-0")} /></span></button>
    </Container>
    <div className={cn("grid overflow-hidden bg-white transition-[grid-template-rows] duration-300 ease-out xl:hidden", open ? "grid-rows-[1fr] border-t border-line" : "grid-rows-[0fr]")}><div className="min-h-0">
      <Container className="py-3">
        <form onSubmit={search} role="search" className="mb-2 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 md:hidden"><Search className="size-4 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Que cherchez-vous ?" aria-label="Rechercher un produit" className="w-full bg-transparent text-sm outline-none" /></form>
        <ul>{NAV.map(([h, l]) => <li key={h}><Link href={h} className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-surface">{l}</Link></li>)}
          <li><Link href="/account" className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-surface">Mon compte</Link></li><li><Link href="/vendor" className="block rounded-xl px-3 py-3 text-base font-semibold text-brand-600 hover:bg-surface">Espace boutique</Link></li>
          <li className="px-3 pb-1 pt-2 text-sm text-slate-500">{phone}</li></ul></Container></div></div>
  </header>)
}
