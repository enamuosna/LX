"use client"
import { useState } from "react"
import Tracking from "@/components/order/Tracking"
import Button from "@/components/ui/Button"
import Container from "@/components/ui/Container"
import { Field, Input } from "@/components/ui/Field"
import PageHeader from "@/components/ui/PageHeader"

export default function TrackPage() {
  const [ref, setRef] = useState(""), [phone, setPhone] = useState(""), [q, setQ] = useState<{ r: string; p: string } | null>(null)
  return (<><PageHeader title="Suivre ma commande" />
    <Container className="py-8">
      <form className="mb-8 grid max-w-3xl items-end gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); setQ({ r: ref.replace(/\D/g, ""), p: phone.replace(/\D/g, "") }) }}>
        <Field label="N° de commande">{(id) => <Input id={id} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="ex : 12" required />}</Field>
        <Field label="Votre téléphone">{(id) => <Input id={id} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 000 00 00" required />}</Field>
        <Button size="lg">Suivre</Button></form>
      {q && <Tracking key={q.r + q.p} refNo={q.r} phone={q.p} />}</Container></>)
}
