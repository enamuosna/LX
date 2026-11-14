"use client"
import { useCallback, useEffect, useState } from "react"
import Modal from "@/components/vendor/Modal"
import Shell, { useVendor } from "@/components/vendor/Shell"
import { fcfa } from "@/lib/medusa"
import { vendorApi } from "@/lib/vendor"

const toB64 = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(f) })
const priceOf = (p: any) => p.variants?.[0]?.prices?.find((x: any) => x.currency_code === "xof")?.amount ?? 0
const stockOf = (p: any) => p.variants?.[0]?.inventory_items?.[0]?.inventory?.location_levels?.[0]?.stocked_quantity ?? 0

function ProductForm({ product, onDone, onClose }: { product?: any; onDone: () => void; onClose: () => void }) {
  const { toast } = useVendor(); const [busy, setBusy] = useState(false), [preview, setPreview] = useState<string | null>(null)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget)
    try {
      if (product) await vendorApi(`/products/${product.id}`, { name: f.get("name"), description: f.get("description"), price: Number(f.get("price")), stock: Number(f.get("stock")) })
      else {
        const body: any = { name: f.get("name"), description: f.get("description"), price: f.get("price"), old_price: f.get("old_price") || undefined, stock: f.get("stock") }
        const img = f.get("image") as File; if (img && img.size) { body.image_mime = img.type; body.image_base64 = await toB64(img) }
        await vendorApi("/products", body)
      }
      toast(product ? "Produit mis à jour." : "Produit ajouté et publié."); onDone(); onClose()
    } catch (er: any) { toast(er.message, true); setBusy(false) }
  }
  return (<Modal title={product ? "Modifier le produit" : "Ajouter un produit"} onClose={onClose}>
    <form id="pf" onSubmit={submit}>
      <div className="vd-f"><label>Nom du produit</label><input className="vd-in" name="name" defaultValue={product?.title} required autoFocus /></div>
      <div className="vd-row"><div className="vd-f"><label>Prix (FCFA)</label><input className="vd-in" type="number" min={1} name="price" defaultValue={product ? priceOf(product) : ""} required /></div>
        <div className="vd-f"><label>Stock</label><input className="vd-in" type="number" min={0} name="stock" defaultValue={product ? stockOf(product) : 1} required /></div></div>
      {!product && <div className="vd-f"><label>Ancien prix / promotion (optionnel)</label><input className="vd-in" type="number" min={0} name="old_price" placeholder="Prix barré affiché" /></div>}
      <div className="vd-f"><label>Caractéristiques</label><textarea className="vd-in" name="description" defaultValue={product?.description || ""} placeholder="Marque, modèle, état, garantie…" /></div>
      {!product && <div className="vd-f"><label>Photo</label><label className="vd-drop">{preview ? <img src={preview} alt="" /> : <i className="fa fa-camera" style={{ fontSize: 26, display: "block", marginBottom: 6 }} />}{preview ? "Changer la photo" : "Cliquez pour choisir une image (JPG, PNG, WebP · 2 Mo max)"}
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null) }} /></label></div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}><button type="button" className="vd-btn" onClick={onClose}>Annuler</button><button className="vd-btn pri" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button></div>
    </form></Modal>)
}

function Products() {
  const { shop, toast } = useVendor(); const approved = shop.status === "approved"
  const [list, setList] = useState<any[] | null>(null), [q, setQ] = useState(""), [modal, setModal] = useState<null | "new" | any>(null)
  const load = useCallback(() => vendorApi("/products").then((d) => setList(d.products)).catch((e) => toast(e.message, true)), [toast])
  useEffect(() => { load() }, [load])
  const toggle = async (p: any) => { try { await vendorApi(`/products/${p.id}`, { active: p.status !== "published" }); toast(p.status === "published" ? "Produit masqué de la vitrine." : "Produit publié."); load() } catch (e: any) { toast(e.message, true) } }
  const shown = (list || []).filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
  return (<>
    <div className="vd-tool"><div className="vd-search"><i className="fa fa-search" /><input placeholder="Rechercher un produit…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <span style={{ color: "#6b7280" }}>{shown.length} produit(s)</span>
      <button className="vd-btn pri" disabled={!approved} onClick={() => setModal("new")}><i className="fa fa-plus" /> Ajouter un produit</button></div>
    {!approved && <div className="vd-banner"><i className="fa fa-lock" /><div>L&apos;ajout et la modification de produits seront disponibles une fois votre boutique agréée.</div></div>}
    {!list ? <div className="vd-grid">{[1, 2, 3, 4].map((i) => <div key={i} className="vd-sk" style={{ height: 300 }} />)}</div> : !shown.length ? <div className="vd-empty"><i className="fa fa-cubes" />{q ? "Aucun produit ne correspond." : "Aucun produit pour le moment. Ajoutez votre premier produit !"}</div> :
      <div className="vd-grid">{shown.map((p) => { const s = stockOf(p), on = p.status === "published", old = p.metadata?.old_price
        return (<div key={p.id} className={`vd-prod ${on ? "" : "off"}`}>
          <div className="vd-pimg">{p.thumbnail ? <img src={p.thumbnail} alt="" /> : <i className="fa fa-image" style={{ fontSize: 40, color: "#c3c9d4" }} />}<span className={`vd-badge ${on ? "b-approved" : "b-draft"}`}>{on ? "Publié" : "Masqué"}</span></div>
          <div className="vd-pb"><h4>{p.title}</h4><div className="vd-price">{fcfa(priceOf(p))}{old ? <del>{fcfa(old)}</del> : null}</div>
            <span className={`vd-stock ${s === 0 ? "s-out" : s <= 3 ? "s-low" : "s-ok"}`}>{s === 0 ? "Rupture de stock" : s <= 3 ? `Stock faible : ${s}` : `${s} en stock`}</span></div>
          <div className="vd-pf"><button className={`vd-sw ${on ? "on" : ""}`} disabled={!approved} onClick={() => toggle(p)}><span className="t" />{on ? "En vitrine" : "Masqué"}</button>
            <button className="vd-btn sm" disabled={!approved} onClick={() => setModal(p)}><i className="fa fa-pencil" /> Modifier</button></div>
        </div>) })}</div>}
    {modal && <ProductForm product={modal === "new" ? undefined : modal} onDone={load} onClose={() => setModal(null)} />}
  </>)
}
export default function VendorProducts() { return <Shell title="Mes produits" subtitle="Gérez votre catalogue, vos prix et votre stock."><Products /></Shell> }
