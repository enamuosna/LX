"use client"
import { useState } from "react"
import Tracking from "@/components/Tracking"
export default function TrackPage() {
  const [ref, setRef] = useState(""), [phone, setPhone] = useState(""), [q, setQ] = useState<{ r: string; p: string } | null>(null)
  return (<><div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>Suivre ma commande</h2></div></div>
    <div className="section"><div className="container"><form className="form-inline" style={{ marginBottom: 25 }} onSubmit={(e) => { e.preventDefault(); setQ({ r: ref.replace(/\D/g, ""), p: phone.replace(/\D/g, "") }) }}>
      <input className="input" style={{ display: "inline-block", width: 220 }} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="N° de commande" required />{" "}
      <input className="input" style={{ display: "inline-block", width: 220 }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Votre téléphone" required />{" "}
      <button className="primary-btn" style={{ borderRadius: 40 }}>Suivre</button></form>
      {q && <Tracking key={q.r + q.p} refNo={q.r} phone={q.p} />}</div></div></>)
}
