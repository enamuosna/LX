import { fcfa } from "@/lib/medusa"

export const METHOD: Record<string, string> = { cash: "Espèces", wave: "Wave", om: "Orange Money", card: "Carte bancaire" }
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!))
const open = (title: string, body: string, width: string) => {
  const w = window.open("", "_blank", "width=420,height=720"); if (!w) return
  w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><style>@page{margin:6mm}body{font:12px/1.45 ui-monospace,Menlo,monospace;width:${width};margin:0 auto;color:#000}h1{font-size:16px;text-align:center;margin:0}.c{text-align:center}.r{text-align:right}table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}hr{border:0;border-top:1px dashed #000;margin:8px 0}.b{font-weight:700;font-size:14px}</style>${body}<script>window.onload=()=>window.print()</script>`)
  w.document.close()
}

export function printReceipt(sale: any, shop: { name: string; phone?: string; address?: string }) {
  const rows = (sale.items as any[]).map((i) => `<tr><td colspan="3">${esc(i.title)}</td></tr><tr><td>${i.quantity} x ${fcfa(i.unit_price)}</td><td></td><td class="r">${fcfa(i.quantity * i.unit_price)}</td></tr>`).join("")
  open(`Ticket ${sale.number}`, `<h1>${esc(shop.name)}</h1><div class="c">${shop.address ? esc(shop.address) + "<br>" : ""}${shop.phone ? "Tél " + esc(shop.phone) : ""}</div><hr>
  <div>Ticket n° ${sale.number}<br>${new Date(sale.created_at).toLocaleString("fr-FR")}</div><hr><table>${rows}</table><hr>
  <table><tr><td>Sous-total</td><td class="r">${fcfa(sale.subtotal)}</td></tr>${sale.discount ? `<tr><td>Remise</td><td class="r">-${fcfa(sale.discount)}</td></tr>` : ""}<tr class="b"><td>TOTAL</td><td class="r">${fcfa(sale.total)}</td></tr>
  <tr><td>Paiement</td><td class="r">${METHOD[sale.payment_method]}</td></tr>${sale.payment_method === "cash" ? `<tr><td>Reçu</td><td class="r">${fcfa(sale.amount_received)}</td></tr><tr><td>Rendu</td><td class="r">${fcfa(sale.change_given)}</td></tr>` : ""}</table><hr>
  <div class="c">Merci de votre visite.<br>Conservez ce ticket pour tout échange.</div>`, "72mm")
}

export function printClosing(day: string, s: any, shop: { name: string }) {
  const rows = Object.entries(s.by as Record<string, { count: number; total: number }>).map(([m, v]) => `<tr><td>${METHOD[m]} (${v.count})</td><td class="r">${fcfa(v.total)}</td></tr>`).join("")
  open(`Clôture ${day}`, `<h1>${esc(shop.name)}</h1><div class="c">Clôture de caisse du ${new Date(day + "T12:00:00").toLocaleDateString("fr-FR", { dateStyle: "full" })}</div><hr><table>${rows}</table><hr>
  <table><tr><td>Ventes</td><td class="r">${s.count}</td></tr><tr><td>Articles vendus</td><td class="r">${s.units}</td></tr><tr><td>Remises</td><td class="r">${fcfa(s.discount)}</td></tr><tr><td>Tickets annulés</td><td class="r">${s.voided}</td></tr><tr class="b"><td>TOTAL</td><td class="r">${fcfa(s.total)}</td></tr></table><hr>
  <div>Espèces attendues en caisse : <b>${fcfa(s.by.cash.total)}</b></div><br><div>Compté : ______________</div><br><div>Signature : ______________</div>`, "72mm")
}
