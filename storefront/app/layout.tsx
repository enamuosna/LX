import type { Metadata, Viewport } from "next"
import { CartProvider } from "@/lib/cart"
import { ToastProvider } from "@/components/ui/Toast"
import "./globals.css"

export const metadata: Metadata = { title: "Lo Soxla ? / Lx — Conciergerie de courses et livraison au Sénégal", description: "Trouvez un produit chez nos boutiques agréées, on le livre. Sa Soxla, Sunu Soxla." }
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0B7A43" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><body><CartProvider><ToastProvider>{children}</ToastProvider></CartProvider></body></html>)
}
