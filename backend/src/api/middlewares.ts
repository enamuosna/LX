import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import cors from "cors"

const origins = (process.env.STORE_CORS || "http://localhost:3000").split(",").map((s) => s.trim())

export default defineMiddlewares({
  routes: [
    // Envoi d'images en base64 (photos produit, visuels publicitaires) : limite relevée
    { matcher: "/vendor/products*", methods: ["POST"], bodyParser: { sizeLimit: "6mb" } },
    { matcher: "/admin/lx/ad-images", methods: ["POST"], bodyParser: { sizeLimit: "6mb" } },
    // Espace boutique : acteur personnalisé « shop » (auth emailpass), appelé depuis la vitrine Next.js
    { matcher: "/vendor*", middlewares: [cors({ origin: origins, credentials: true }), authenticate("shop", ["session", "bearer"])] },
  ],
})
