import { ArrowRight, Bike, Globe, Lock, MessageCircle, PhoneCall, Search, SearchCheck, Smartphone, Truck, Link2 } from "lucide-react"
import Link from "next/link"
import ProductGrid from "@/components/product/ProductGrid"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"
import Container from "@/components/ui/Container"
import { listProducts } from "@/lib/medusa"
export const dynamic = "force-dynamic"

const Title = ({ children }: { children: React.ReactNode }) => <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">{children}<span className="mx-auto mt-3 block h-1 w-14 rounded bg-accent-500" /></h2>

const SERVICES = [
  { icon: Link2, name: "LINK", tag: "Mise en relation", text: "Cherchez un produit : la plateforme affiche le produit ou un similaire avec photo, prix et disponibilité.", href: "/store", cta: "Chercher un produit" },
  { icon: SearchCheck, name: "OUTIKO", tag: "Recherche du produit et mise en relation", text: "Recherche infructueuse ? L'équipe Lx se charge de trouver le produit pour vous.", href: "/outiko?type=outiko", cta: "Demander une recherche" },
  { icon: Bike, name: "JEULIKO", tag: "Récupération & envoi simple", text: "Produit déjà acheté ou réservé chez le vendeur ? Lx le récupère et vous le livre.", href: "/outiko?type=jeuliko", cta: "Demander une récupération" },
]
const STEPS = [["Je cherche", "Je saisis le produit recherché sur le portail."], ["Je choisis", "Je sélectionne le produit (prix, disponibilité, boutique)."], ["La boutique valide", "La boutique est notifiée. Sans réponse sous 30 min, Lx prend le relais."], ["Je suis livré", "Le livreur récupère le colis scellé. Je suis ma commande avec son numéro."]]
const CHANNELS = [[Globe, "Portail web"], [Smartphone, "Application mobile"], [PhoneCall, "Centre d'appels & SMS"], [MessageCircle, "WhatsApp"]] as const

export default async function Home() {
  const products = await listProducts({ limit: 4 }).catch(() => [])
  return (<>
    <section className="bg-gradient-to-br from-brand-800 via-brand-600 to-brand-500 text-white">
      <Container className="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-5 lg:py-20">
        <div className="min-w-0 lg:col-span-3">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide">« Sa Soxla, Sunu Soxla » — Par nous &amp; pour vous</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">Lo Soxla ?<br /><span className="text-accent-400">Qu&apos;avez-vous besoin ?</span></h1>
          <p className="mt-5 max-w-xl text-white/85">Lx met en relation les consommateurs et les boutiques agréées, puis livre votre commande à la demande, avec suivi et fiabilité. Fini les retards et les colis abîmés du « Tiak Tiak » informel.</p>
          <form action="/store" className="mt-7 flex max-w-xl overflow-hidden rounded-full bg-white p-1.5 shadow-xl">
            <input name="q" placeholder="Quel produit cherchez-vous ?" aria-label="Produit recherché" className="w-0 min-w-0 flex-1 bg-transparent px-4 text-ink outline-none" />
            <button className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-ink hover:bg-accent-400"><Search className="size-4" />Chercher</button></form></div>
        <ul className="min-w-0 space-y-3 lg:col-span-2">{[[Search, "Trouvez un produit, son prix et sa disponibilité"], [MessageCircle, "La boutique est alertée instantanément"], [Lock, "Transaction suivie : validation, paiement, livraison"], [Truck, "Un livreur Lx récupère le colis scellé"]].map(([I, t]: any) =>
          <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-sm font-semibold backdrop-blur"><I className="size-5 shrink-0 text-accent-400" />{t}</li>)}</ul>
      </Container></section>

    <section id="services" className="scroll-mt-32 py-16"><Container><Title>Nos services</Title>
      <div className="grid gap-5 md:grid-cols-3">{SERVICES.map((s) => (
        <div key={s.name} className="flex flex-col rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><s.icon className="size-7" /></div>
          <h3 className="text-xl font-extrabold">{s.name}</h3><p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-500">{s.tag}</p>
          <p className="flex-1 text-sm text-slate-600">{s.text}</p>
          <Link href={s.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:gap-2.5">{s.cta}<ArrowRight className="size-4" /></Link></div>))}</div></Container></section>

    <section className="pb-16"><Container><Title>Disponible chez nos boutiques agréées</Title>
      <ProductGrid products={products} />
      <div className="mt-8 text-center"><Button href="/store" size="lg">Voir tous les produits</Button></div></Container></section>

    <section id="commande" className="scroll-mt-32 bg-surface py-16"><Container><Title>Comment passer commande</Title>
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([t, d], i) => (
        <li key={t} className="rounded-2xl bg-white p-6 text-center shadow-sm"><div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-brand-600 text-lg font-extrabold text-white">{i + 1}</div>
          <h3 className="font-bold">{t}</h3><p className="mt-1.5 text-sm text-slate-600">{d}</p></li>))}</ol>
      <Banner tone="warn" className="mt-8"><strong>À savoir :</strong> Lx n&apos;effectue aucune inspection ni contrôle qualité. La conformité relève de la boutique agréée (garantie légale : réparation ou remplacement, service après-vente pour les matériels).</Banner></Container></section>

    <section className="bg-night py-14 text-white"><Container><h2 className="mb-8 text-center text-2xl font-bold">Commandez par le canal qui vous convient</h2>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">{CHANNELS.map(([I, l]) => <div key={l} className="flex flex-col items-center gap-3 rounded-2xl bg-white/5 py-6 text-center"><I className="size-8 text-accent-500" /><strong className="text-sm">{l}</strong></div>)}</div></Container></section>
  </>)
}
