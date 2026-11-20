import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Photo } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Input, Text } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { api } from "./api"

type Ad = { id: string; slot: string; advertiser: string; title: string; image_url: string; link_url: string; active: boolean; starts_at: string | null; ends_at: string | null; priority: number; impressions: number; clicks: number }
type Slots = Record<string, { label: string; size: string }>
const EMPTY = { slot: "home_banner", advertiser: "", title: "", image_url: "", link_url: "", priority: 1, starts_at: "", ends_at: "", active: true }
const day = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "")
const RATIO: Record<string, string> = { home_banner: "4 / 1", store_top: "6 / 1", product_side: "3 / 2", cart_bottom: "6 / 1" }
const statusOf = (a: Ad): ["live" | "soon" | "ended" | "off", string, "green" | "orange" | "red" | "grey"] => {
  const now = Date.now()
  if (!a.active) return ["off", "Désactivée", "grey"]
  if (a.starts_at && new Date(a.starts_at).getTime() > now) return ["soon", "Programmée", "orange"]
  if (a.ends_at && new Date(a.ends_at).getTime() < now) return ["ended", "Terminée", "red"]
  return ["live", "En ligne", "green"]
}
const ctr = (a: { clicks: number; impressions: number }) => (a.impressions ? `${((a.clicks / a.impressions) * 100).toFixed(1)} %` : "0 %")
const toB64 = (f: File) => new Promise<string>((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = ko; r.readAsDataURL(f) })

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4"><Text size="small" className="text-ui-fg-subtle">{label}</Text><Heading level="h2" className="mt-1">{value}</Heading></div>
)

const PublicitesPage = () => {
  const [ads, setAds] = useState<Ad[]>([]), [slots, setSlots] = useState<Slots>({}), [err, setErr] = useState(""), [msg, setMsg] = useState("")
  const [form, setForm] = useState<any>(EMPTY), [editing, setEditing] = useState<string | null>(null), [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [drag, setDrag] = useState(false)
  const [fStatus, setFStatus] = useState("all"), [fSlot, setFSlot] = useState("all")
  const file = useRef<HTMLInputElement>(null), formTop = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => { try { const d = await api("ads"); setAds(d.ads); setSlots(d.slots); setErr("") } catch (e: any) { setErr(e.message) } }, [])
  useEffect(() => { load() }, [load])
  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }))
  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 3500) }
  const openForm = (init: any, id: string | null) => { setForm(init); setEditing(id); setOpen(true); setErr(""); setTimeout(() => formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50) }

  const upload = async (f?: File) => {
    if (!f) return
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return setErr("Format accepté : JPG, PNG, WebP ou GIF.")
    if (f.size > 3 * 1024 * 1024) return setErr("Image trop lourde (3 Mo maximum).")
    setBusy(true); setErr("")
    try { const d = await api("ad-images", { mime: f.type, base64: await toB64(f) }); set("image_url", d.url) } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }
  const save = async () => {
    setBusy(true)
    try { await api(editing ? `ads/${editing}` : "ads", { ...form, starts_at: form.starts_at || null, ends_at: form.ends_at || null }); setOpen(false); setEditing(null); setForm(EMPTY); await load(); flash(editing ? "Publicité enregistrée." : "Publicité créée.") } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  const live = ads.filter((a) => statusOf(a)[0] === "live")
  const totals = useMemo(() => ads.reduce((t, a) => ({ impressions: t.impressions + a.impressions, clicks: t.clicks + a.clicks }), { impressions: 0, clicks: 0 }), [ads])
  const shown = ads.filter((a) => (fStatus === "all" || statusOf(a)[0] === fStatus) && (fSlot === "all" || a.slot === fSlot))
  const ready = form.slot && form.advertiser.trim() && form.title.trim() && form.image_url && form.link_url.trim()

  return (
    <div className="flex flex-col gap-4">
      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div><Heading>Publicités</Heading><Text className="text-ui-fg-subtle">Gérez les encarts publicitaires affichés sur le site Lx. Rien ne s&apos;affiche tant qu&apos;aucune publicité n&apos;est en ligne.</Text></div>
          <Button onClick={() => (open && !editing ? setOpen(false) : openForm(EMPTY, null))}>{open && !editing ? "Fermer" : "Nouvelle publicité"}</Button>
        </div>
        {msg && <Text className="px-6 pb-3 text-ui-fg-interactive">{msg}</Text>}
        {err && <Text className="px-6 pb-3 text-ui-fg-error">{err}</Text>}
        <div className="grid grid-cols-2 gap-3 border-t px-6 py-4 md:grid-cols-4">
          <Stat label="En ligne" value={live.length} /><Stat label="Vues" value={totals.impressions.toLocaleString("fr-FR")} /><Stat label="Clics" value={totals.clicks.toLocaleString("fr-FR")} /><Stat label="Taux de clic" value={ctr(totals)} />
        </div>
      </Container>

      <Container className="p-0">
        <div className="px-6 py-4"><Heading level="h2">Emplacements</Heading><Text className="text-ui-fg-subtle">Quatre endroits du site peuvent accueillir une publicité. Choisissez-en un pour filtrer, ou ajoutez-y directement.</Text></div>
        <div className="grid gap-3 border-t px-6 py-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(slots).map(([k, s]) => {
            const n = live.filter((a) => a.slot === k).length
            return (
              <div key={k} className={`rounded-lg border p-3 ${fSlot === k ? "border-ui-border-interactive" : "border-ui-border-base"}`}>
                <div className="mb-3 flex items-center justify-center rounded bg-ui-bg-subtle" style={{ aspectRatio: "3 / 1" }}><div className="rounded bg-ui-bg-component" style={{ aspectRatio: RATIO[k], height: "60%", maxWidth: "90%", border: "1px dashed var(--border-strong)" }} /></div>
                <Text weight="plus" size="small">{s.label}</Text>
                <Text size="small" className="text-ui-fg-subtle">{s.size}</Text>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge color={n ? "green" : "grey"}>{n ? `${n} en ligne` : "Libre"}</Badge>
                  <div className="flex gap-1"><Button size="small" variant="secondary" onClick={() => setFSlot(fSlot === k ? "all" : k)}>{fSlot === k ? "Tout voir" : "Filtrer"}</Button><Button size="small" variant="secondary" onClick={() => openForm({ ...EMPTY, slot: k }, null)}>Ajouter</Button></div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>

      {open && (
        <Container className="p-0" ref={formTop as any}>
          <div className="px-6 py-4"><Heading level="h2">{editing ? "Modifier la publicité" : "Nouvelle publicité"}</Heading></div>
          <div className="grid gap-4 border-t px-6 py-5 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="text-sm">Emplacement
                <select className="mt-1 block w-full rounded-md border border-ui-border-base bg-ui-bg-field p-2" value={form.slot} onChange={(e) => set("slot", e.target.value)}>{Object.entries(slots).map(([k, v]) => <option key={k} value={k}>{v.label}, {v.size}</option>)}</select></label>
              <label className="text-sm">Annonceur <span className="text-ui-fg-subtle">(visible ici seulement)</span><Input value={form.advertiser} onChange={(e) => set("advertiser", e.target.value)} placeholder="ex : Orange Sénégal" /></label>
              <label className="text-sm">Texte de l&apos;image <span className="text-ui-fg-subtle">(lu par les lecteurs d&apos;écran)</span><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="ex : Forfait internet à 5 000 FCFA" /></label>
              <label className="text-sm">Lien au clic<Input value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://… ou /store" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Début <span className="text-ui-fg-subtle">(facultatif)</span><Input type="date" value={day(form.starts_at)} onChange={(e) => set("starts_at", e.target.value)} /></label>
                <label className="text-sm">Fin <span className="text-ui-fg-subtle">(facultatif)</span><Input type="date" value={day(form.ends_at)} onChange={(e) => set("ends_at", e.target.value)} /></label>
              </div>
              <div className="grid grid-cols-2 items-end gap-3">
                <label className="text-sm">Priorité, de 0 à 100<Input type="number" min={0} max={100} value={form.priority} onChange={(e) => set("priority", e.target.value)} /></label>
                <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={(e) => set("active", e.target.checked)} />Activée</label>
              </div>
              <Text size="small" className="text-ui-fg-subtle">Avec plusieurs publicités sur le même emplacement, celle de priorité plus haute s&apos;affiche plus souvent.</Text>
            </div>
            <div className="flex flex-col gap-3">
              <Text size="small" weight="plus">Visuel, format conseillé {slots[form.slot]?.size}</Text>
              <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]) }} onClick={() => file.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && file.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed p-3 text-center ${drag ? "border-ui-border-interactive bg-ui-bg-highlight" : "border-ui-border-strong bg-ui-bg-subtle"}`} style={{ minHeight: 140 }}>
                {form.image_url ? <img src={form.image_url} alt={form.title} style={{ maxHeight: 190, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} /> : <><Photo /><Text size="small">{busy ? "Envoi en cours…" : "Glissez une image ici ou cliquez pour la choisir"}</Text><Text size="small" className="text-ui-fg-subtle">JPG, PNG, WebP ou GIF, 3 Mo maximum</Text></>}
              </div>
              <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = "" }} />
              {form.image_url && <div className="flex gap-2"><Button size="small" variant="secondary" onClick={() => file.current?.click()}>Changer l&apos;image</Button><Button size="small" variant="secondary" onClick={() => set("image_url", "")}>Retirer</Button></div>}
              <label className="text-sm">ou adresse d&apos;une image<Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://… ou /img/pub.png" /></label>
            </div>
          </div>
          <div className="flex gap-2 border-t px-6 py-4"><Button onClick={save} isLoading={busy} disabled={!ready}>{editing ? "Enregistrer" : "Créer la publicité"}</Button><Button variant="secondary" onClick={() => { setOpen(false); setEditing(null) }}>Annuler</Button>{!ready && <Text size="small" className="self-center text-ui-fg-subtle">Renseignez tous les champs et ajoutez une image.</Text>}</div>
        </Container>
      )}

      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Heading level="h2">Toutes les publicités ({shown.length})</Heading>
          <div className="flex gap-2">
            <select className="rounded-md border border-ui-border-base bg-ui-bg-field p-1.5 text-sm" value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label="Statut"><option value="all">Tous les statuts</option><option value="live">En ligne</option><option value="soon">Programmées</option><option value="ended">Terminées</option><option value="off">Désactivées</option></select>
            <select className="rounded-md border border-ui-border-base bg-ui-bg-field p-1.5 text-sm" value={fSlot} onChange={(e) => setFSlot(e.target.value)} aria-label="Emplacement"><option value="all">Tous les emplacements</option>{Object.entries(slots).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{["Visuel", "Annonceur", "Emplacement", "Période", "Statut", "Vues", "Clics", ""].map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderTop: "1px solid var(--border-base)", borderBottom: "1px solid var(--border-base)" }}>{h}</th>)}</tr></thead>
            <tbody>{shown.map((a) => {
              const [, label, color] = statusOf(a)
              return (
                <tr key={a.id}>{[
                  <img key="i" src={a.image_url} alt={a.title} style={{ height: 44, width: 88, objectFit: "cover", borderRadius: 6 }} />,
                  <><b>{a.advertiser}</b><br /><small>{a.title}</small></>,
                  slots[a.slot]?.label ?? a.slot,
                  <small key="p">{a.starts_at || a.ends_at ? `${day(a.starts_at) || "…"} au ${day(a.ends_at) || "…"}` : "Sans limite"}</small>,
                  <Badge key="b" color={color}>{label}</Badge>, a.impressions.toLocaleString("fr-FR"), <>{a.clicks}<small> ({ctr(a)})</small></>,
                  <div key="x" className="flex gap-1"><Button size="small" variant="secondary" onClick={() => openForm({ ...a, starts_at: day(a.starts_at), ends_at: day(a.ends_at) }, a.id)}>Modifier</Button>
                    <Button size="small" variant="secondary" onClick={async () => { await api(`ads/${a.id}`, { active: !a.active }); load() }}>{a.active ? "Désactiver" : "Activer"}</Button>
                    <Button size="small" variant="danger" onClick={async () => { if (confirm("Supprimer définitivement cette publicité ?")) { await api(`ads/${a.id}`, undefined, "DELETE"); load(); flash("Publicité supprimée.") } }}>Supprimer</Button></div>,
                ].map((c, j) => <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-base)", verticalAlign: "middle" }}>{c}</td>)}</tr>
              )
            })}</tbody>
          </table>
          {!shown.length && <Text className="p-6 text-ui-fg-subtle">{ads.length ? "Aucune publicité ne correspond à ce filtre." : "Aucune publicité pour le moment. Cliquez sur « Nouvelle publicité » ou sur « Ajouter » dans un emplacement."}</Text>}
        </div>
      </Container>
    </div>
  )
}
export const config = defineRouteConfig({ label: "Publicités", icon: Photo })
export default PublicitesPage
