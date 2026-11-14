"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { vendorLogin } from "@/lib/vendor"
export default function VendorLogin() {
  const r = useRouter(); const [err, setErr] = useState(""), [busy, setBusy] = useState(false)
  return (<div className="vd-login">
    <div className="l"><div className="vd-logo">L<i>x</i></div><h1>Espace boutique</h1><p>Recevez les commandes de vos clients, confirmez-les en un clic et laissez Lx s&apos;occuper de la livraison.</p>
      <ul><li><i className="fa fa-bell" />Alerte instantanée à chaque commande</li><li><i className="fa fa-cubes" />Gérez vos produits, prix et stock</li><li><i className="fa fa-truck" />Un livreur Lx récupère le colis scellé</li></ul></div>
    <div className="r"><form onSubmit={async (e) => { e.preventDefault(); setErr(""); setBusy(true); const f = new FormData(e.currentTarget); try { await vendorLogin(String(f.get("email")), String(f.get("password"))); r.push("/vendor") } catch (x: any) { setErr(x.message); setBusy(false) } }}>
      <h2>Connexion</h2><p>Accédez à votre tableau de bord.</p>
      {err && <div className="vd-banner red" style={{ margin: "14px 0" }}><i className="fa fa-exclamation-circle" />{err}</div>}
      <div className="vd-f" style={{ marginTop: 18 }}><label>Email</label><input className="vd-in" type="email" name="email" required autoFocus /></div>
      <div className="vd-f"><label>Mot de passe</label><input className="vd-in" type="password" name="password" required /></div>
      <button className="vd-btn pri" style={{ width: "100%", justifyContent: "center", padding: 12 }} disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
      <p style={{ marginTop: 18, fontSize: 13 }}>Pas encore boutique agréée ? <Link href="/register-shop" style={{ color: "#0B7A43", fontWeight: 700 }}>Inscrivez-vous</Link> · <Link href="/" style={{ color: "#6b7280" }}>← Retour au site</Link></p></form></div></div>)
}
