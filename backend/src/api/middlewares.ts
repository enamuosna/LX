import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import cors from "cors"

const origins = (process.env.STORE_CORS || "http://localhost:3000").split(",").map((s) => s.trim())

export default defineMiddlewares({
  routes: [
    // Espace boutique : acteur personnalisé « shop » (auth emailpass), appelé depuis la vitrine Next.js
    { matcher: "/vendor*", middlewares: [cors({ origin: origins, credentials: true }), authenticate("shop", ["session", "bearer"])] },
  ],
})
