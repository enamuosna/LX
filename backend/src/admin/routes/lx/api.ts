export const api = async (path: string, body?: unknown, method?: string) => {
  const r = await fetch(`/admin/lx/${path}`, { credentials: "include", method: method ?? (body === undefined ? "GET" : "POST"), headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.message || "Erreur")
  return j
}
