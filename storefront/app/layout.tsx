import type { Metadata, Viewport } from "next"
import { CartProvider } from "@/lib/cart"
import { CustomerProvider } from "@/lib/customer"
import { FavoritesProvider } from "@/lib/favorites"
import { ToastProvider } from "@/components/ui/Toast"
import "./globals.css"

export const metadata: Metadata = { applicationName: "Lx", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "Lx", statusBarStyle: "default" }, icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" }, formatDetection: { telephone: false }, title: "Lx, Lo Soxla ? Courses et livraison au Sénégal", description: "Trouvez un produit chez nos boutiques agréées, on le livre. Sa Soxla, Sunu Soxla." }
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0B7A43" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><body><CustomerProvider><FavoritesProvider><CartProvider><ToastProvider>{children}</ToastProvider></CartProvider></FavoritesProvider></CustomerProvider></body></html>)
}
