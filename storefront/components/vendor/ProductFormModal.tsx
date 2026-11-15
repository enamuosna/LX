"use client"
import { Camera } from "lucide-react"
import { useState } from "react"
import Button from "@/components/ui/Button"
import { Field, Input, Textarea } from "@/components/ui/Field"
import Modal from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { vendorApi } from "@/lib/vendor"

const toB64 = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(f) })
export const priceOf = (p: any) => p.variants?.[0]?.prices?.find((x: any) => x.currency_code === "xof")?.amount ?? 0
export const stockOf = (p: any) => p.variants?.[0]?.inventory_items?.[0]?.inventory?.location_levels?.[0]?.stocked_quantity ?? 0

export default function ProductFormModal({ product, onDone, onClose }: { product?: any; onDone: () => void; onClose: () => void }) {
  const toast = useToast(); const [busy, setBusy] = useState(false), [preview, setPreview] = useState<string | null>(null)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget)
    try {
      if (product) await vendorApi(`/products/${product.id}`, { name: f.get("name"), description: f.get("description"), price: Number(f.get("price")), stock: Number(f.get("stock")) })
      else {
        const body: any = { name: f.get("name"), description: f.get("description"), price: f.get("price"), old_price: f.get("old_price") || undefined, stock: f.get("stock") }
        const file = f.get("image") as File; if (file && file.size) { body.image_mime = file.type; body.image_base64 = await toB64(file) }
        await vendorApi("/products", body)
      }
      toast(product ? "Produit mis à jour." : "Produit ajouté et publié."); onDone(); onClose()
    } catch (er: any) { toast(er.message, true); setBusy(false) }
  }
  return (<Modal title={product ? "Modifier le produit" : "Ajouter un produit"} onClose={onClose}
    footer={<><Button variant="secondary" type="button" onClick={onClose}>Annuler</Button><Button type="submit" form="pf" loading={busy} data-testid="save-product">Enregistrer</Button></>}>
    <form id="pf" onSubmit={submit} className="space-y-4">
      <Field label="Nom du produit">{(id) => <Input id={id} name="name" defaultValue={product?.title} required autoFocus />}</Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix (FCFA)">{(id) => <Input id={id} type="number" min={1} name="price" defaultValue={product ? priceOf(product) : ""} required />}</Field>
        <Field label="Stock">{(id) => <Input id={id} type="number" min={0} name="stock" defaultValue={product ? stockOf(product) : 1} required />}</Field></div>
      {!product && <Field label="Ancien prix / promotion (optionnel)">{(id) => <Input id={id} type="number" min={0} name="old_price" placeholder="Prix barré affiché" />}</Field>}
      <Field label="Caractéristiques">{(id) => <Textarea id={id} name="description" defaultValue={product?.description || ""} placeholder="Marque, modèle, état, garantie…" />}</Field>
      {!product && <Field label="Photo">{(id) => <label htmlFor={id} className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 transition hover:border-brand-600 hover:bg-brand-50">
        {preview ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="" className="mx-auto mb-2 max-h-32 rounded-lg" /> : <Camera className="mx-auto mb-2 size-7" />}
        {preview ? "Changer la photo" : "Cliquez pour choisir une image (JPG, PNG, WebP · 2 Mo max)"}
        <input id={id} type="file" name="image" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const x = e.target.files?.[0]; setPreview(x ? URL.createObjectURL(x) : null) }} /></label>}</Field>}
    </form></Modal>)
}
