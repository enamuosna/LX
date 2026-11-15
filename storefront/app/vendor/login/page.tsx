"use client"
import { Boxes, Bell, Truck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"
import { Field, Input } from "@/components/ui/Field"
import Logo from "@/components/ui/Logo"
import { vendorLogin } from "@/lib/vendor"

export default function VendorLogin() {
  const r = useRouter(); const [err, setErr] = useState(""), [busy, setBusy] = useState(false)
  return (<div className="grid min-h-screen lg:grid-cols-2">
    <section className="hidden flex-col justify-center bg-gradient-to-br from-night via-brand-800 to-brand-600 p-14 text-white lg:flex">
      <Logo tagline={false} className="[&>span]:text-6xl" /><h1 className="mt-8 text-3xl font-extrabold">Espace boutique</h1>
      <p className="mt-3 max-w-md text-white/80">Recevez les commandes de vos clients, confirmez-les en un clic et laissez Lx s&apos;occuper de la livraison.</p>
      <ul className="mt-8 space-y-4 text-sm font-semibold">{[[Bell, "Alerte instantanée à chaque commande"], [Boxes, "Gérez vos produits, prix et stock"], [Truck, "Un livreur Lx récupère le colis scellé"]].map(([I, t]: any) =>
        <li key={t} className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/10"><I className="size-5 text-accent-400" /></span>{t}</li>)}</ul></section>
    <section className="grid place-items-center bg-surface p-6"><form className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-white p-8 shadow-sm" onSubmit={async (e) => {
      e.preventDefault(); setErr(""); setBusy(true); const f = new FormData(e.currentTarget)
      try { await vendorLogin(String(f.get("email")), String(f.get("password"))); r.push("/vendor") } catch (x: any) { setErr(x.message); setBusy(false) } }}>
      <div><h2 className="text-2xl font-extrabold">Connexion</h2><p className="text-sm text-slate-500">Accédez à votre tableau de bord.</p></div>
      {err && <Banner tone="danger">{err}</Banner>}
      <Field label="Email">{(id) => <Input id={id} type="email" name="email" required autoFocus />}</Field>
      <Field label="Mot de passe">{(id) => <Input id={id} type="password" name="password" required />}</Field>
      <Button full size="lg" loading={busy} data-testid="login">Se connecter</Button>
      <p className="text-center text-sm text-slate-500">Pas encore boutique agréée ? <Link href="/register-shop" className="font-bold text-brand-600">Inscrivez-vous</Link><br /><Link href="/" className="text-slate-500 hover:text-ink">← Retour au site</Link></p></form></section></div>)
}
