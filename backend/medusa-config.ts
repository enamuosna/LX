import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // PostgreSQL du docker-compose sans SSL ; mettre DATABASE_SSL=true pour une base managée distante.
    databaseDriverOptions: { connection: { ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false } },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    { resolve: "./src/modules/lx" },
    // Fichiers (photos produits) : l'URL publique doit être celle du backend (ex. https://api.exemple.com).
    ...(process.env.BACKEND_PUBLIC_URL ? [{
      resolve: "@medusajs/medusa/file",
      options: { providers: [{ resolve: "@medusajs/medusa/file-local", id: "local", options: { backend_url: `${process.env.BACKEND_PUBLIC_URL.replace(/\/$/, "")}/static` } }] },
    }] : []),
  ],
})
