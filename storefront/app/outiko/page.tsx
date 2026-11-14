"use client"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import SimpleForm from "@/components/SimpleForm"

function Inner() {
  const sp = useSearchParams(); const type = sp.get("type") === "jeuliko" ? "jeuliko" : "outiko"
  const fields = [{ name: "name", placeholder: "Nom complet" }, { name: "phone", placeholder: "Téléphone / WhatsApp" },
    { name: "details", textarea: true, placeholder: type === "outiko" ? "Quel produit cherchez-vous ? (marque, modèle, budget…)" : "Que doit-on récupérer chez le vendeur ? (produit, nom du vendeur, référence…)", defaultValue: sp.get("details") || "" },
    ...(type === "jeuliko" ? [{ name: "pickup", placeholder: "Adresse de récupération (chez le vendeur)" }, { name: "delivery", placeholder: "Adresse de livraison" }] : [])]
  return (<><div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>{type === "outiko" ? "OUTIKO — On trouve le produit pour vous" : "JEULIKO — Récupération & envoi simple"}</h2>
    <p style={{ margin: "5px 0 0" }}><Link href="/outiko?type=outiko">OUTIKO</Link> · <Link href="/outiko?type=jeuliko">JEULIKO</Link></p></div></div>
    <div className="section"><div className="container"><div className="row"><div className="col-md-7">
      <SimpleForm key={type} endpoint="/store/lx/service-requests" extra={{ type }} fields={fields} submitLabel="Envoyer ma demande" okMessage="Demande enregistrée. Un conseiller Lx vous contacte rapidement." /></div></div></div></div></>)
}
export default function Page() { return <Suspense><Inner /></Suspense> }
