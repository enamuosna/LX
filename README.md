# Lx — « Lo Soxla ? » — Architecture headless (API-first)

- **backend/** : Medusa.js v2 (Node 20+, PostgreSQL) + module métier `lx`
- **storefront/** : Next.js 15 (App Router, React 19), design Lx (template Electro)

## Lancement avec Docker (recommandé)
Prérequis : Docker Desktop démarré.
```bash
cp .env.example .env        # (optionnel) changez mots de passe et secrets
docker compose up --build
```
Le premier démarrage (3 à 6 min) construit les images, crée la base, applique les migrations, charge les données de démonstration et crée l'administrateur. Les suivants sont immédiats.

| Service | Adresse |
|---|---|
| Vitrine | http://localhost:3000 |
| Admin Medusa (menu **Lx**) | http://localhost:9000/app — `admin@lx.sn` / `ChangeMe!2026` |
| Espace boutique | http://localhost:3000/vendor — `boutique@lx.sn` / `ChangeMe!2026` |

- Aucune clé à copier : la vitrine récupère seule sa clé publique et appelle l'API via son propre proxy (`/medusa/*`, pas de CORS).
- Données persistantes : volumes `pgdata` (base) et `uploads` (photos produits). `docker compose down` les conserve ; `docker compose down -v` efface tout.
- Logs : `docker compose logs -f backend` · Arrêt : `docker compose down`.
- Sur un serveur (pas en local) : mettre l'URL publique dans `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `LX_STOREFRONT_URL` du `docker-compose.yml`, changer tous les mots de passe/secrets, ajouter HTTPS (reverse proxy) et Redis.

---
## Démarrage sans Docker
```bash
# 1. PostgreSQL : créer base + utilisateur
createdb lx_medusa            # ou via psql

# 2. Backend
cd backend
cp .env.example .env          # renseigner DATABASE_URL et les secrets
npm install
npx medusa db:migrate         # tables Medusa + module Lx + liens
npm run seed                  # région Sénégal (FCFA), livraison, boutique + produits de démo, clé publique
npx medusa user -e admin@lx.sn -p 'MotDePasseSolide'
npm run dev                   # API http://localhost:9000 — Admin http://localhost:9000/app

# 3. Storefront
cd ../storefront
cp .env.example .env.local    # NEXT_PUBLIC_MEDUSA_PK = clé « Vitrine Lx » affichée par le seed
npm install && npm run dev    # http://localhost:3000
```
Comptes de démo (à changer) : vendeur `boutique@lx.sn` / `ChangeMe!2026`.
Clé publique : affichée à la fin du seed, ou Admin > Paramètres > Clés API (« Vitrine Lx »).

## Ce qui est géré par Medusa (standard)
Catalogue, prix (FCFA/XOF), stock/inventaire, panier, commande, paiement (« paiement à la livraison » = provider système), région Sénégal, option de livraison « Livraison Lx » (frais fixes, `LX_DELIVERY_FEE`), back-office admin.

## Ce que le module `lx` ajoute (backend/src/modules/lx)
| Besoin du projet | Implémentation |
|---|---|
| Boutiques agréées (inscription, validation) | modèle `shop`, `POST /store/lx/shops/register`, validation dans Admin > **Lx** |
| Espace boutique | acteur d'auth `shop` (`/auth/shop/emailpass`), API `/vendor/*`, pages `/vendor` du storefront |
| Une commande = une part par boutique | modèle `shop_order`, créé par le subscriber `order.placed` |
| Alerte boutique (WhatsApp) | API WhatsApp Cloud si `LX_WA_TOKEN`/`LX_WA_PHONE_ID`, sinon lien wa.me dans l'admin |
| Relance si pas de réponse > 30 min | job planifié `escalate-shop-orders` (toutes les 5 min) |
| Statuts : en attente → confirmée → colis récupéré → livrée | `transition()` avec règles de transition ; refus/annulation de toutes les parts → annulation de la commande Medusa |
| Livreurs | modèle `courier`, assignation dans Admin > Lx |
| OUTIKO / JEULIKO | modèle `service_request`, `POST /store/lx/service-requests`, suivi dans Admin > Lx |
| Suivi client (n° de commande + téléphone) | `GET /store/lx/track` |
| Produit ↔ boutique | `src/links/product-shop.ts` (Module Link) |

## Back-office
Admin Medusa > menu **Lx** : commandes par boutique (statuts, livreur, encaissement, alerte WhatsApp), boutiques (agréer/suspendre : une boutique suspendue voit ses produits repasser en brouillon), demandes OUTIKO/JEULIKO, livreurs.

## Production
- `cd backend && npm run build && npm run start` ; `cd storefront && npm run build && npm run start`
- Ajouter **Redis** (event bus, workflows, cache) pour un déploiement multi-instances ; stockage de fichiers S3 (le provider local est réservé au dev).
- Renseigner `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`, HTTPS.

## Limites connues
- Paiements mobile money / carte : la préférence est enregistrée (metadata du panier) mais aucun PSP n'est branché (Wave, Orange Money, PayDunya… à intégrer comme payment provider Medusa) ; l'encaissement est marqué à la main.
- Frais de livraison : un seul tarif par commande, pas par boutique.
- Pas d'application mobile, de SMS ni de saisie de commande par le centre d'appels (à ajouter via l'API admin).
- Le jeton vendeur est stocké dans le navigateur (localStorage) ; à durcir (cookie httpOnly) avant mise en production.
- Les images de démo sont servies par le storefront (`/img`) ; les produits créés par les boutiques sont envoyés au stockage de fichiers Medusa.
