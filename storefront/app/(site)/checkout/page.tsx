import CheckoutForm from "@/components/checkout/CheckoutForm"
export const dynamic = "force-dynamic"

// Les numéros Wave / Orange Money sont lus à l'exécution : modifiables sans reconstruire l'image.
export default function CheckoutPage() {
  const phone = process.env.NEXT_PUBLIC_LX_PHONE || "+221 77 000 00 00"
  return <CheckoutForm wave={process.env.LX_WAVE_NUMBER || phone} om={process.env.LX_OM_NUMBER || phone} />
}
