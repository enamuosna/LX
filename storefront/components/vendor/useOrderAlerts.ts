"use client"
import { useCallback, useEffect, useRef, useState } from "react"

const KEY = "lx_vendor_alerts"
/** Petit « ding » généré par le navigateur (aucun fichier audio à charger). */
function beep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext, ctx = new Ctx(), now = ctx.currentTime
    ;[880, 1320].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.0001, now + i * 0.18); g.gain.exponentialRampToValueAtTime(0.25, now + i * 0.18 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.4); o.start(now + i * 0.18); o.stop(now + i * 0.18 + 0.45) })
  } catch {}
}

/** Alerte sonore, notification du navigateur et titre d'onglet quand une nouvelle commande arrive. */
export function useOrderAlerts(pendingIds: string[] | null, onNew: (n: number) => void) {
  const [enabled, setEnabled] = useState(false), seen = useRef<Set<string> | null>(null), cb = useRef(onNew); cb.current = onNew
  useEffect(() => { try { setEnabled(localStorage.getItem(KEY) === "1") } catch {} }, [])
  useEffect(() => {
    if (!pendingIds) return
    if (!seen.current) { seen.current = new Set(pendingIds); return } // premier chargement : rien à signaler
    const fresh = pendingIds.filter((id) => !seen.current!.has(id)); pendingIds.forEach((id) => seen.current!.add(id))
    if (!fresh.length) return
    cb.current(fresh.length)
    if (enabled) { beep(); try { if (Notification.permission === "granted") new Notification("Nouvelle commande Lx", { body: `${fresh.length} commande(s) à confirmer.` }) } catch {} }
    const old = document.title; document.title = `(${fresh.length}) Nouvelle commande`; const t = setTimeout(() => (document.title = old), 8000); return () => clearTimeout(t)
  }, [pendingIds, enabled])
  const toggle = useCallback(async () => {
    if (enabled) { setEnabled(false); try { localStorage.setItem(KEY, "0") } catch {} ; return }
    try { if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission() } catch {}
    beep(); setEnabled(true); try { localStorage.setItem(KEY, "1") } catch {}
  }, [enabled])
  return { enabled, toggle }
}
