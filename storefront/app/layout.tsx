import type { Metadata } from "next"
import { CartProvider } from "@/lib/cart"

export const metadata: Metadata = { title: "Lo Soxla ? / Lx — Conciergerie de courses et livraison au Sénégal", description: "Trouvez un produit chez nos boutiques agréées, on le livre. Sa Soxla, Sunu Soxla." }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700" rel="stylesheet" />
    {["bootstrap.min", "font-awesome.min", "style", "lx", "vendor"].map((c) => <link key={c} rel="stylesheet" href={`/css/${c}.css`} />)}
  </head><body><CartProvider>{children}</CartProvider></body></html>)
}
