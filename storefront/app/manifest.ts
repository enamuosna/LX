import type { MetadataRoute } from "next"

// Permet d'installer Lx sur l'écran d'accueil (Android, iOS) et de l'ouvrir comme une application.
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Lx, Lo Soxla ?", short_name: "Lx", description: "Courses et livraison au Sénégal", start_url: "/", scope: "/", display: "standalone", orientation: "portrait", background_color: "#f1f4ec", theme_color: "#0b7a43", lang: "fr",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
    shortcuts: [{ name: "Caisse", url: "/vendor/pos" }, { name: "Suivre une commande", url: "/track" }] }
}
