import Tracking from "@/components/Tracking"
export const dynamic = "force-dynamic"
export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ phone?: string }> }) {
  const { id } = await params; const { phone } = await searchParams
  return (<><div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>Merci ! Votre commande est enregistrée</h2><p style={{ margin: "5px 0 0" }}>Gardez votre numéro de commande <strong>#{id}</strong> et votre téléphone pour la suivre.</p></div></div>
    <div className="section"><div className="container"><Tracking refNo={id} phone={phone || ""} /></div></div></>)
}
