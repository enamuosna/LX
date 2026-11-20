"use client"
import { Camera, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import { Field, Input, Textarea } from "@/components/ui/Field"
import Modal from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { img } from "@/lib/medusa"
import { vendorApi } from "@/lib/vendor"

const toB64 = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(f) })
export const priceOf = (p: any) => p.variants?.[0]?.prices?.find((x: any) => x.currency_code === "xof")?.amount ?? 0
const lvl = (p: any) => p.variants?.[0]?.inventory_items?.[0]?.inventory?.location_levels?.[0]
export const physicalOf = (p: any) => Number(lvl(p)?.stocked_quantity ?? 0)
/** Stock disponible à la vente : physique moins réservé par les commandes en cours. */
export const stockOf = (p: any) => physicalOf(p) - Number(lvl(p)?.reserved_quantity ?? 0)
export const costOf = (p: any) => Number(p.metadata?.cost_price) || 0
export const thresholdOf = (p: any) => (p.metadata?.low_stock ?? null) === null ? 3 : Number(p.metadata.low_stock)

export default function ProductFormModal({ product, onDone, onClose }: { product?: any; onDone: () => void; onClose: () => void }) {
  const toast = useToast(); const [busy, setBusy] = useState(false), [preview, setPreview] = useState<string | null>(null), [cats, setCats] = useState<{ id: string; name: string }[]>([])
  useEffect(() => { vendorApi("/categories").then((d) => setCats(d.categories || [])).catch(() => {}) }, [])
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget)
    try {
      const body: any = { name: f.get("name"), description: f.get("description"), price: Number(f.get("price")), old_price: f.get("old_price") ? Number(f.get("old_price")) : 0,
        sku: f.get("sku"), category_id: f.get("category_id") || undefined, cost_price: f.get("cost_price") ? Number(f.get("cost_price")) : 0, low_stock: f.get("low_stock") }
      const file = f.get("image") as File; if (file && file.size) { body.image_mime = file.type; body.image_base64 = await toB64(file) }
      if (product) { body.stock = physicalOf(product) === Number(f.get("stock")) ? undefined : Number(f.get("stock")); await vendorApi(`/products/${product.id}`, body) }
      else { body.stock = f.get("stock"); await vendorApi("/products", body) }
      toast(product ? "Produit mis à jour." : "Produit ajouté et publié."); onDone(); onClose()
    } catch (er: any) { toast(er.message, true); setBusy(false) }
  }
  return (<Modal title={product ? "Modifier le produit" : "Ajouter un produit"} onClose={onClose}
    footer={<>{product && <Button variant="ghost" type="button" className="mr-auto text-bissap" data-testid="delete-product" onClick={async () => { if (!confirm(`Supprimer « ${product.title} » définitivement ?`)) return; try { await vendorApi(`/products/${product.id}`, undefined, "DELETE"); toast("Produit supprimé."); onDone(); onClose() } catch (er: any) { toast(er.message, true) } }}><Trash2 className="size-4" />Supprimer</Button>}<Button variant="secondary" type="button" onClick={onClose}>Annuler</Button><Button type="submit" form="pf" loading={busy} data-testid="save-product">Enregistrer</Button></>}>
    <form id="pf" onSubmit={submit} className="space-y-4">
      <Field label="Nom du produit">{(id) => <Input id={id} name="name" defaultValue={product?.title} required autoFocus />}</Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix (FCFA)">{(id) => <Input id={id} type="number" min={1} name="price" defaultValue={product ? priceOf(product) : ""} required />}</Field>
        <Field label={product ? "Stock physique" : "Stock de départ"}>{(id) => <Input id={id} type="number" min={0} name="stock" defaultValue={product ? physicalOf(product) : 1} required />}</Field></div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix d'achat (FCFA)" hint="Sert au calcul de votre marge. Visible par vous seul.">{(id) => <Input id={id} type="number" min={0} name="cost_price" defaultValue={product ? costOf(product) || "" : ""} data-testid="cost-price" />}</Field>
        <Field label="Alerte stock faible à" hint="Vous êtes prévenu en dessous de ce seuil.">{(id) => <Input id={id} type="number" min={0} name="low_stock" defaultValue={product ? thresholdOf(product) : 3} data-testid="low-stock" />}</Field></div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Référence (SKU)">{(id) => <Input id={id} name="sku" defaultValue={product?.variants?.[0]?.sku ?? ""} placeholder="ex : CASQ-NOIR-L" data-testid="sku" />}</Field>
        <Field label="Catégorie">{(id) => <select id={id} name="category_id" defaultValue={product?.categories?.[0]?.id ?? ""} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm"><option value="">Sans catégorie</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</Field></div>
      <Field label="Prix avant promotion (optionnel)" hint="Affiché barré à côté du prix : vos clients voient la promotion. Videz le champ pour la retirer.">{(id) => <Input id={id} type="number" min={0} name="old_price" defaultValue={product?.metadata?.old_price ?? ""} placeholder="ex : 60000" data-testid="old-price" />}</Field>
      <Field label="Caractéristiques">{(id) => <Textarea id={id} name="description" defaultValue={product?.description || ""} placeholder="Marque, modèle, état, garantie…" />}</Field>
      <Field label="Photo">{(id) => <label htmlFor={id} className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 transition hover:border-brand-600 hover:bg-brand-50">
        {preview || product?.thumbnail ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview || img(product.thumbnail)} alt="" className="mx-auto mb-2 max-h-32 rounded-lg" /> : <Camera className="mx-auto mb-2 size-7" />}
        {preview || product?.thumbnail ? "Changer la photo" : "Cliquez pour choisir une image (JPG, PNG ou WebP, 2 Mo max)"}
        <input id={id} type="file" name="image" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const x = e.target.files?.[0]; setPreview(x ? URL.createObjectURL(x) : null) }} /></label>}</Field>
    </form></Modal>)
}
