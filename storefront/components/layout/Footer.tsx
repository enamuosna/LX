import Link from "next/link"
import Container from "@/components/ui/Container"
import Logo from "@/components/ui/Logo"

const L = ({ href, children }: { href: string; children: React.ReactNode }) => <li><Link href={href} className="inline-block text-white/65 transition hover:translate-x-1 hover:text-accent-500">{children}</Link></li>
const H = ({ children }: { children: React.ReactNode }) => <h3 className="mb-4 text-base font-bold text-white">{children}</h3>

export default function Footer({ phone, email }: { phone: string; email: string }) {
  return (<footer className="mt-24 overflow-hidden bg-night text-sm text-white/65">
    <Container className="relative grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div><Logo tone="light" /><p className="mt-5 max-w-xs text-base leading-relaxed text-white/80">Sa Soxla, Sunu Soxla. Vos courses, livrées par des gens d&apos;ici, chez des boutiques que nous connaissons.</p></div>
      <div><H>Services</H><ul className="space-y-2.5"><L href="/store">LINK, trouver un produit</L><L href="/outiko?type=outiko">OUTIKO, on le cherche pour vous</L><L href="/outiko?type=jeuliko">JEULIKO, on le récupère</L></ul></div>
      <div><H>Boutiques</H><ul className="space-y-2.5"><L href="/register-shop">Devenir boutique agréée</L><L href="/vendor">Espace boutique</L></ul></div>
      <div><H>Nous joindre</H><ul className="space-y-2.5"><li>{phone}</li><li>{email}</li><L href="/track">Suivre ma commande</L></ul></div>
    </Container>
    <div className="border-t border-white/10 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} Lo Soxla ? Lx. Par nous et pour vous.</div>
  </footer>)
}
