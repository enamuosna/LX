#!/bin/sh
set -e
echo "[lx] Migrations…"
npx medusa db:migrate
echo "[lx] Données initiales (une seule fois)…"
npx medusa exec ./src/scripts/seed-lx.js
echo "[lx] Zones de livraison…"
npx medusa exec ./src/scripts/seed-zones.js
echo "[lx] Compte administrateur…"
npx medusa user -e "${ADMIN_EMAIL:-admin@lx.sn}" -p "${ADMIN_PASSWORD:-ChangeMe!2026}" 2>&1 | tail -1 || true
echo "[lx] Démarrage de l'API sur :9000"
exec npx medusa start
