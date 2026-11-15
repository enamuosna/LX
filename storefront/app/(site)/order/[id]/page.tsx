import Tracking from "@/components/order/Tracking"
import Container from "@/components/ui/Container"
import PageHeader from "@/components/ui/PageHeader"
export const dynamic = "force-dynamic"
export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ phone?: string }> }) {
  const { id } = await params; const { phone } = await searchParams
  return (<><PageHeader title="Merci ! Votre commande est enregistrée">Gardez votre numéro de commande <strong>#{id}</strong> et votre téléphone pour la suivre.</PageHeader>
    <Container className="py-8"><Tracking refNo={id} phone={phone || ""} /></Container></>)
}
