import { ArrowRight, ArrowUpRight, Bike, Link2, Search, SearchCheck } from "lucide-react"
import Link from "next/link"
import HowItWorks from "@/components/home/HowItWorks"
import LiveOrder from "@/components/home/LiveOrder"
import ProductGrid from "@/components/product/ProductGrid"
import Button from "@/components/ui/Button"
import Container from "@/components/ui/Container"
import { listProducts } from "@/lib/medusa"
export const dynamic = "force-dynamic"

const rise = (ms: number) => ({ animationDelay: `${ms}ms` })

export default async function Home() {
  const products = await listProducts({ limit: 4 }).catch(() => [])
  return (<>
    <section className="relative overflow-hidden bg-surface">
      <Container className="grid items-center gap-16 pb-24 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-20">
        <div className="min-w-0">
          <h1 className="animate-rise font-display text-[clamp(3.4rem,9vw,7rem)] font-extrabold leading-[0.9] tracking-tighter" style={rise(0)}>Lo Soxla ?</h1>
          <p className="mt-6 max-w-lg animate-rise font-display text-2xl font-semibold leading-snug text-brand-700 sm:text-3xl" style={rise(120)}>Dites ce qu&apos;il vous faut, on vous l&apos;apporte.</p>
          <p className="mt-5 max-w-md animate-rise text-lg leading-relaxed text-slate-600" style={rise(220)}>Des boutiques agréées de Dakar, une alerte WhatsApp pour la boutique, un livreur Lx qui récupère le colis scellé chez elle.</p>
          <form action="/store" role="search" className="mt-8 flex max-w-xl animate-rise items-center rounded-full bg-white p-2 shadow-[0_18px_40px_-20px_rgba(16,35,26,0.35)] ring-2 ring-transparent transition focus-within:ring-brand-600" style={rise(320)}>
            <Search className="ml-4 size-5 shrink-0 text-slate-400" />
            <input name="q" placeholder="Un téléphone, un casque, un ordinateur…" aria-label="Produit recherché" className="w-0 min-w-0 flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-slate-400" />
            <button className="rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 active:scale-95">Chercher</button></form>
          <p className="mt-5 animate-rise text-sm text-slate-500" style={rise(420)}>Introuvable ? <Link href="/outiko?type=outiko" className="font-bold text-brand-600 underline decoration-accent-500 decoration-2 underline-offset-4">Demandez à OUTIKO</Link>, nous le cherchons pour vous.</p></div>
        <div className="animate-rise" style={rise(300)}><LiveOrder /></div>
      </Container></section>

    <section id="services" className="scroll-mt-24 py-24"><Container>
      <h2 className="max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">Trois façons de se faire livrer</h2>
      <div className="mt-12 grid gap-4 md:grid-cols-6">
        <Link href="/store" className="group relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-[2rem] bg-brand-600 p-8 text-white md:col-span-3 md:row-span-2">
          <div className="absolute -bottom-16 -right-16 size-64 rounded-full bg-brand-500/60 transition-transform duration-700 group-hover:scale-125" />
          <Link2 className="relative size-12 text-accent-500 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
          <div className="relative"><h3 className="text-5xl font-extrabold">LINK</h3><p className="mt-3 max-w-sm text-lg leading-relaxed text-white/85">Vous cherchez un produit. Nous affichons celui des boutiques agréées, avec photo, prix et disponibilité.</p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition group-hover:gap-3">Chercher un produit<ArrowRight className="size-4" /></span></div></Link>
        <Link href="/outiko?type=outiko" className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-accent-500 p-8 md:col-span-3">
          <ArrowUpRight className="absolute right-6 top-6 size-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          <SearchCheck className="size-9 transition-transform duration-500 group-hover:scale-110" />
          <div className="mt-10"><h3 className="text-3xl font-extrabold">OUTIKO</h3><p className="mt-2 max-w-sm leading-relaxed text-ink/80">Rien trouvé ? Décrivez le produit, l&apos;équipe Lx le cherche et vous met en relation avec le vendeur.</p></div></Link>
        <Link href="/outiko?type=jeuliko" className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-night p-8 text-white md:col-span-3">
          <ArrowUpRight className="absolute right-6 top-6 size-6 text-accent-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          <Bike className="size-9 text-accent-500 transition-transform duration-500 group-hover:translate-x-2" />
          <div className="mt-10"><h3 className="text-3xl font-extrabold">JEULIKO</h3><p className="mt-2 max-w-sm leading-relaxed text-white/75">Vous avez déjà acheté ou réservé chez un vendeur ? Lx passe le récupérer et vous le livre.</p></div></Link>
      </div></Container></section>

    <section className="pb-24"><Container>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><h2 className="max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">En stock chez nos boutiques</h2>
        <Link href="/store" className="group inline-flex items-center gap-2 font-bold text-brand-600">Voir tous les produits<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></div>
      <ProductGrid products={products} /></Container></section>

    <section id="commande" className="scroll-mt-24 bg-surface py-24"><Container>
      <h2 className="mb-14 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">De la recherche à la livraison</h2>
      <HowItWorks />
      <p className="mt-14 max-w-2xl border-l-4 border-accent-500 pl-5 text-[15px] leading-relaxed text-slate-600">Lx ne contrôle pas la qualité des produits. La conformité relève de la boutique agréée, avec la garantie légale : réparation ou remplacement, et service après-vente pour les matériels. Vous pouvez commander sur le site, par WhatsApp, par SMS ou par téléphone.</p></Container></section>

    <section className="py-24"><Container>
      <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-600 px-8 py-14 text-white sm:px-14">
        <div className="absolute -right-10 -top-10 size-56 rounded-full bg-accent-500" /><div className="absolute -bottom-20 right-24 size-48 rounded-full bg-brand-500/60" />
        <div className="relative max-w-xl"><h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">Vous tenez une boutique ?</h2>
          <p className="mt-4 text-lg text-white/85">Recevez chaque commande sur WhatsApp, confirmez en un clic, et laissez Lx livrer.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button href="/register-shop" variant="accent" size="lg">Devenir boutique agréée</Button><Link href="/vendor" className="inline-flex items-center rounded-full px-6 py-3.5 font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10">Espace boutique</Link></div></div></div></Container></section>
  </>)
}
