#!/bin/sh
set -e
# Valeurs par défaut quand la plateforme (Render) fournit l'adresse publique du service dans RENDER_EXTERNAL_URL.
if [ -n "$RENDER_EXTERNAL_URL" ]; then
  : "${BACKEND_PUBLIC_URL:=$RENDER_EXTERNAL_URL}"
fi
export BACKEND_PUBLIC_URL
if [ -n "$BACKEND_PUBLIC_URL" ]; then
  export STORE_CORS="${STORE_CORS:-${LX_STOREFRONT_URL:-$BACKEND_PUBLIC_URL}}"
  export ADMIN_CORS="${ADMIN_CORS:-$BACKEND_PUBLIC_URL}"
  export AUTH_CORS="${AUTH_CORS:-$BACKEND_PUBLIC_URL${LX_STOREFRONT_URL:+,$LX_STOREFRONT_URL}}"
fi
echo "[lx] Migrations…"
npx medusa db:migrate
echo "[lx] Données initiales (une seule fois)…"
npx medusa exec ./src/scripts/seed-lx.js
echo "[lx] Identifiants boutiques…"
npx medusa exec ./src/scripts/backfill-shop-codes.js
echo "[lx] Zones de livraison…"
npx medusa exec ./src/scripts/seed-zones.js
echo "[lx] Compte administrateur…"
npx medusa user -e "${ADMIN_EMAIL:-admin@lx.sn}" -p "${ADMIN_PASSWORD:-ChangeMe!2026}" 2>&1 | tail -1 || true
echo "[lx] Démarrage de l'API sur :${PORT:-9000}"
exec npx medusa start
