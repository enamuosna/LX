"use client"
import { useState } from "react"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"
import { Field, Input } from "@/components/ui/Field"
import { useCustomer } from "@/lib/customer"
import { cn } from "@/lib/cn"

export default function AuthPanel() {
  const { login, register } = useCustomer(); const [mode, setMode] = useState<"login" | "register">("login"), [err, setErr] = useState(""), [busy, setBusy] = useState(false)
  const tab = (m: typeof mode) => cn("flex-1 rounded-full py-2 text-sm font-bold transition", mode === m ? "bg-white shadow-sm" : "text-slate-500")
  return (<div className="mx-auto max-w-md"><div className="mb-6 flex rounded-full bg-surface p-1"><button className={tab("login")} onClick={() => { setMode("login"); setErr("") }}>Connexion</button><button className={tab("register")} onClick={() => { setMode("register"); setErr("") }}>Créer un compte</button></div>
    <form className="space-y-4" onSubmit={async (e) => {
      e.preventDefault(); setErr(""); setBusy(true); const f = new FormData(e.currentTarget), g = (k: string) => String(f.get(k) || "").trim()
      try { mode === "login" ? await login(g("email"), g("password")) : await register({ email: g("email"), password: g("password"), first_name: g("first_name"), last_name: g("last_name") || "-", phone: g("phone") }) }
      catch (x: any) { setErr(x.message); setBusy(false) } }}>
      {err && <Banner tone="danger">{err}</Banner>}
      {mode === "register" && <><div className="grid grid-cols-2 gap-3"><Field label="Prénom">{(id) => <Input id={id} name="first_name" required />}</Field><Field label="Nom">{(id) => <Input id={id} name="last_name" required />}</Field></div>
        <Field label="Téléphone WhatsApp" hint="Pour suivre vos commandes.">{(id) => <Input id={id} name="phone" placeholder="77 000 00 00" required />}</Field></>}
      <Field label="Email">{(id) => <Input id={id} type="email" name="email" required autoComplete="email" />}</Field>
      <Field label="Mot de passe" hint={mode === "register" ? "8 caractères minimum." : undefined}>{(id) => <Input id={id} type="password" name="password" minLength={mode === "register" ? 8 : undefined} required autoComplete={mode === "login" ? "current-password" : "new-password"} />}</Field>
      <Button full size="lg" loading={busy} data-testid="auth-submit">{mode === "login" ? "Me connecter" : "Créer mon compte"}</Button>
      {mode === "login" && <p className="text-center text-sm text-slate-500">Vous tenez une boutique ? <a href="/vendor/login" className="font-bold text-brand-600">Espace boutique</a></p>}</form></div>)
}
