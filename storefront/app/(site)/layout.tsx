import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"

const PHONE = process.env.NEXT_PUBLIC_LX_PHONE || "+221 77 000 00 00", EMAIL = process.env.NEXT_PUBLIC_LX_EMAIL || "contact@lx.sn"

// Site public : en-tête et pied de page. L'espace boutique (/vendor) a son propre habillage.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (<><Header phone={PHONE} email={EMAIL} /><main>{children}</main><Footer phone={PHONE} email={EMAIL} /></>)
}
