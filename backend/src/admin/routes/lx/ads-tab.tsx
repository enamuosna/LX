import { Badge, Button, Input, Text } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"
import { api } from "./api"

type Ad = { id: string; slot: string; advertiser: string; title: string; image_url: string; link_url: string; active: boolean; starts_at: string | null; ends_at: string | null; priority: number; impressions: number; clicks: number }
const EMPTY = { slot: "home_banner", advertiser: "", title: "", image_url: "", link_url: "", priority: 1, starts_at: "", ends_at: "", active: true }
const day = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "")
const state = (a: Ad): [string, "green" | "grey" | "orange" | "red"] => {
  const now = Date.now()
  if (!a.active) return ["Désactivée", "grey"]
  if (a.starts_at && new Date(a.starts_at).getTime() > now) return ["Programmée", "orange"]
  if (a.ends_at && new Date(a.ends_at).getTime() < now) return ["Terminée", "red"]
  return ["En ligne", "green"]
}

export default function AdsTab() {
  const [ads, setAds] = useState<Ad[]>([]), [slots, setSlots] = useState<Record<string, { label: string; size: string }>>({}), [err, setErr] = useState("")
  const [form, setForm] = useState<any>(EMPTY), [editing, setEditing] = useState<string | null>(null), [open, setOpen] = useState(false)
  const load = useCallback(async () => { try { const d = await api("ads"); setAds(d.ads); setSlots(d.slots); setErr("") } catch (e: any) { setErr(e.message) } }, [])
  useEffect(() => { load() }, [load])
  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }))
  const save = async () => {
    try { await api(editing ? `ads/${editing}` : "ads", { ...form, starts_at: form.starts_at || null, ends_at: form.ends_at || null }); setOpen(false); setEditing(null); setForm(EMPTY); await load() } catch (e: any) { setErr(e.message) }
  }
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4">
        <Text className="text-ui-fg-subtle">Les publicités s&apos;affichent sur le site aux emplacements ci-dessous. Une publicité sans date est toujours en ligne tant qu&apos;elle est activée.</Text>
        <Button size="small" onClick={() => { setForm(EMPTY); setEditing(null); setOpen(!open) }}>{open && !editing ? "Fermer" : "Nouvelle publicité"}</Button>
      </div>
      {err && <Text className="px-6 pb-2 text-ui-fg-error">{err}</Text>}
      {open && (
        <div className="grid gap-3 border-y bg-ui-bg-subtle px-6 py-4 md:grid-cols-2">
          <label className="text-sm">Emplacement
            <select className="mt-1 block w-full rounded border p-2" value={form.slot} onChange={(e) => set("slot", e.target.value)}>{Object.entries(slots).map(([k, v]) => <option key={k} value={k}>{v.label} ({v.size})</option>)}</select></label>
          <label className="text-sm">Annonceur<Input value={form.advertiser} onChange={(e) => set("advertiser", e.target.value)} placeholder="ex : Orange Sénégal" /></label>
          <label className="text-sm">Titre (texte de l&apos;image)<Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="ex : Forfait internet à 5 000 FCFA" /></label>
          <label className="text-sm">Lien au clic<Input value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://…" /></label>
          <label className="text-sm md:col-span-2">Adresse de l&apos;image ({slots[form.slot]?.size})<Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://… ou /img/pub.png" /></label>
          <label className="text-sm">Début (facultatif)<Input type="date" value={day(form.starts_at)} onChange={(e) => set("starts_at", e.target.value)} /></label>
          <label className="text-sm">Fin (facultatif)<Input type="date" value={day(form.ends_at)} onChange={(e) => set("ends_at", e.target.value)} /></label>
          <label className="text-sm">Priorité (0 à 100)<Input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={(e) => set("active", e.target.checked)} />Activée</label>
          {form.image_url && <img src={form.image_url} alt="" style={{ maxHeight: 120, borderRadius: 8 }} className="md:col-span-2" />}
          <div className="flex gap-2 md:col-span-2"><Button onClick={save}>{editing ? "Enregistrer" : "Créer"}</Button><Button variant="secondary" onClick={() => { setOpen(false); setEditing(null) }}>Annuler</Button></div>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Visuel", "Annonceur", "Emplacement", "Période", "Statut", "Vues", "Clics", ""].map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border-base)" }}>{h}</th>)}</tr></thead>
          <tbody>{ads.map((a) => { const [label, color] = state(a); return (
            <tr key={a.id}>
              {[<img key="i" src={a.image_url} alt="" style={{ height: 40, borderRadius: 6 }} />, <><b>{a.advertiser}</b><br /><small>{a.title}</small></>, slots[a.slot]?.label ?? a.slot,
                <small key="p">{a.starts_at || a.ends_at ? `${day(a.starts_at) || "…"} au ${day(a.ends_at) || "…"}` : "Sans limite"}</small>, <Badge key="b" color={color}>{label}</Badge>,
                a.impressions, <>{a.clicks}{a.impressions ? <small> ({((a.clicks / a.impressions) * 100).toFixed(1)} %)</small> : null}</>,
                <div key="x" className="flex gap-1"><Button size="small" variant="secondary" onClick={() => { setForm({ ...a }); setEditing(a.id); setOpen(true) }}>Modifier</Button>
                  <Button size="small" variant="secondary" onClick={async () => { await api(`ads/${a.id}`, { active: !a.active }); load() }}>{a.active ? "Désactiver" : "Activer"}</Button>
                  <Button size="small" variant="danger" onClick={async () => { if (confirm("Supprimer cette publicité ?")) { await api(`ads/${a.id}`, undefined, "DELETE"); load() } }}>Supprimer</Button></div>,
              ].map((c, j) => <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-base)", verticalAlign: "middle" }}>{c}</td>)}
            </tr>) })}</tbody>
        </table>
        {!ads.length && <Text className="p-4 text-ui-fg-subtle">Aucune publicité. Créez la première avec « Nouvelle publicité ».</Text>}
      </div>
    </div>
  )
}
