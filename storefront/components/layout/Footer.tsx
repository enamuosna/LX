import { Mail, Phone } from "lucide-react"
import Link from "next/link"
import Container from "@/components/ui/Container"
import Logo from "@/components/ui/Logo"

const H = ({ children }: { children: React.ReactNode }) => <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{children}</h3>
const L = ({ href, children }: { href: string; children: React.ReactNode }) => <li><Link href={href} className="text-slate-400 transition hover:text-accent-500">{children}</Link></li>

export default function Footer({ phone, email }: { phone: string; email: string }) {
  return (<footer className="mt-16 bg-night text-sm text-slate-400">
    <Container className="grid gap-10 py-12 md:grid-cols-3">
      <div><Logo className="mb-4" /><p className="max-w-xs leading-relaxed">Conciergerie de courses et livraison à la demande au Sénégal. <em className="text-slate-300">Sa Soxla, Sunu Soxla.</em></p></div>
      <div><H>Services</H><ul className="space-y-2.5"><L href="/store">LINK — Mise en relation</L><L href="/outiko?type=outiko">OUTIKO — Recherche produit</L><L href="/outiko?type=jeuliko">JEULIKO — Récupération & envoi</L><L href="/register-shop">Devenir boutique agréée</L></ul></div>
      <div><H>Contact</H><ul className="space-y-2.5">
        <li className="flex items-center gap-2"><Phone className="size-4 text-accent-500" />{phone}</li>
        <li className="flex items-center gap-2"><Mail className="size-4 text-accent-500" />{email}</li><L href="/track">Suivre ma commande</L></ul></div>
    </Container>
    <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} Lo Soxla ? / Lx — Par nous &amp; pour vous</div>
  </footer>)
}
