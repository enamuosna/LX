"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import ServiceForm, { type FieldDef } from "@/components/forms/ServiceForm"
import Container from "@/components/ui/Container"
import PageHeader from "@/components/ui/PageHeader"
import { cn } from "@/lib/cn"

function Inner() {
  const sp = useSearchParams(); const type = sp.get("type") === "jeuliko" ? "jeuliko" : "outiko"
  const fields: FieldDef[] = [{ name: "name", label: "Nom complet" }, { name: "phone", label: "Téléphone / WhatsApp" },
    { name: "details", label: type === "outiko" ? "Produit recherché" : "À récupérer", textarea: true, placeholder: type === "outiko" ? "Marque, modèle, budget…" : "Produit, nom du vendeur, référence…", defaultValue: sp.get("details") || "" },
    ...(type === "jeuliko" ? [{ name: "pickup", label: "Adresse de récupération", placeholder: "Chez le vendeur" }, { name: "delivery", label: "Adresse de livraison" }] : [])]
  const tab = (on: boolean) => cn("rounded-full px-5 py-2 text-sm font-bold transition", on ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:text-brand-600")
  return (<><PageHeader title={type === "outiko" ? "OUTIKO — On trouve le produit pour vous" : "JEULIKO — Récupération & envoi simple"}>
    <div className="mt-3 inline-flex gap-1 rounded-full bg-slate-200 p-1"><Link href="/outiko?type=outiko" className={tab(type === "outiko")}>OUTIKO</Link><Link href="/outiko?type=jeuliko" className={tab(type === "jeuliko")}>JEULIKO</Link></div></PageHeader>
    <Container className="max-w-2xl py-8"><ServiceForm key={type} endpoint="/store/lx/service-requests" extra={{ type }} fields={fields} submitLabel="Envoyer ma demande" okMessage="Demande enregistrée. Un conseiller Lx vous contacte rapidement." /></Container></>)
}
export default function Page() { return <Suspense><Inner /></Suspense> }
