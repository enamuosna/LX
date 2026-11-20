# Lx, « Lo Soxla ? » : architecture headless (API-first)

- **backend/** : Medusa.js v2 (Node 20+, PostgreSQL) + module métier `lx`
- **storefront/** : Next.js 15 (App Router, React 19, TypeScript) : bibliothèque de composants React (`components/ui` : Button, Card, Modal, Field, Toast…) + Tailwind CSS v4, icônes lucide-react

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
| Admin Medusa (menu **Lx**) | http://localhost:9000/app : `admin@lx.sn` / `ChangeMe!2026` |
| Espace boutique | http://localhost:3000/vendor : `boutique@lx.sn` / `ChangeMe!2026` |

- Aucune clé à copier : la vitrine récupère seule sa clé publique et appelle l'API via son propre proxy (`/medusa/*`, pas de CORS).
- Données persistantes : volumes `pgdata` (base) et `uploads` (photos produits). `docker compose down` les conserve ; `docker compose down -v` efface tout.
- Connexion admin : en local le backend tourne en mode développement (cookie de session non « Secure »), sinon l'admin renvoie des erreurs 401 en HTTP. Pour un serveur HTTPS, utilisez `docker-compose.coolify.yml`.
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
npm run dev                   # API http://localhost:9000 : Admin http://localhost:9000/app

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

## Admin en local
Le conteneur tourne en production. En http://localhost le cookie de session est non sécurisé (`LX_COOKIE_SECURE=false`, défaut). Derrière un domaine https ou un tunnel Cloudflare, mettre `LX_COOKIE_SECURE=true`.

## Fonctions avancées
**Espace client** (`/account`) : compte (inscription, connexion), historique des commandes avec suivi, adresses enregistrées (préremplies au paiement), favoris (synchronisés avec le compte), avis notés de 1 à 5 étoiles, publiés uniquement après livraison.

**Espace boutique** : statistiques sur 14 jours (graphique, produits les plus vendus, taux d'acceptation), alerte sonore et notification du navigateur à chaque nouvelle commande, export CSV des commandes, promotion en un champ (prix barré).

**Paiement et livraison**
- Zones de livraison avec frais différents (créées par `seed-zones`, modifiables dans l'admin Medusa : Paramètres, Expéditions).
- Codes promo : `BIENVENUE10` (-10 %) existe par défaut. Les autres se créent dans l'admin Medusa, menu Promotions.
- Wave et Orange Money : chaque boutique renseigne ses propres numéros (WhatsApp des commandes, Wave, Orange Money) dans Espace boutique > Ma boutique. Au paiement, le client règle chaque boutique sur son numéro et saisit une référence par boutique ; la boutique confirme la réception de son paiement. Les frais de livraison se règlent au livreur Lx. Il n'y a pas d'appel à l'API Wave ou Orange Money (compte marchand et clés nécessaires).
- Code de livraison à 4 chiffres : affiché au client, demandé au livreur. L'admin Lx ne peut passer une commande à « Livrée » qu'avec ce code.

**Gestion complète de la boutique (Espace boutique)**
- Inventaire : stock physique, réservé (commandes en cours) et disponible pour chaque produit ; valeur du stock au prix d'achat et au prix de vente ; alertes stock faible (seuil réglable par produit) et rupture.
- Mouvements : entrée, sortie (perte ou casse, correction), inventaire par comptage (seuls les écarts sont enregistrés). Chaque mouvement est journalisé avec la date, la quantité, le stock après et une note. Un stock négatif est refusé.
- Cycle de vie : à la commande le stock est réservé ; à la livraison (code client validé) le stock physique baisse et une ligne « Vente livrée » est ajoutée ; un refus ou une annulation libère la réservation.
- Produits : SKU, catégorie, prix d'achat (visible par la boutique seule), seuil d'alerte, changement de photo, suppression (refusée tant qu'une commande en cours contient le produit).
- Clients : liste des clients servis, nombre de commandes, montant livré, lien WhatsApp.
- Statistiques : marge sur les ventes livrées et par produit (si le prix d'achat est renseigné).
- Exports CSV (commandes, inventaire) et bon de préparation imprimable par commande.
- Coupure réseau : l'espace boutique affiche un bandeau et réessaie automatiquement, sans déconnecter.
- Après mise à jour : `npx medusa db:migrate` (table des mouvements de stock).

**Caisse (vente au comptoir)**
- Espace boutique > Caisse : le client est dans la boutique, le commerçant touche les produits (ou saisit/scanne le SKU puis Entrée), applique une remise et encaisse en espèces (montant reçu et monnaie à rendre), Wave, Orange Money ou carte (terminal de la boutique).
- Le stock physique baisse tout de suite ; la vente est limitée au stock disponible. Chaque vente a un ticket numéroté (imprimable, format 72 mm, réimprimable).
- Onglet « Ventes et clôture » : ventes du jour, total par moyen de paiement, espèces attendues en caisse, annulation d'un ticket (le stock est remis en rayon) et clôture de caisse imprimable.
- Les ventes en caisse apparaissent dans l'inventaire (mouvements « Vente en caisse » / « Vente annulée ») et dans les statistiques (ventes, marge, produits les plus vendus). Aucune livraison Lx n'est déclenchée.
- Après mise à jour : `npx medusa db:migrate` (table des ventes de caisse).

**Mobile (téléphones et tablettes)**
- Mise en page testée de 320 px (petits Android) à iPad, en portrait et paysage : aucun défilement horizontal.
- Espace boutique : barre de navigation en bas de l'écran (Accueil, Caisse, Produits, Inventaire, Plus), panier de caisse en tiroir, inventaire en cartes, fenêtres en feuille qui monte du bas.
- Champs à 16 px (pas de zoom automatique sur iPhone), zones tactiles d'au moins 40 px, respect de l'encoche et de la barre d'accueil iOS (safe-area), hauteur d'écran dynamique (dvh).
- Installable sur l'écran d'accueil (Android et iOS) : manifeste, icônes 192/512 px et icône Apple. Raccourcis : Caisse, Suivre une commande.

**Identifiant public des boutiques**
- Le nom d'une boutique n'est jamais montré aux clients (catalogue, fiche produit, paiement, suivi). Ils voient un identifiant du type `LX-0001`, attribué à l'inscription. La boutique et l'admin voient le nom et l'identifiant.
- Après mise à jour : `npx medusa db:migrate` puis `npx medusa exec ./src/scripts/backfill-shop-codes.ts` (attribue les identifiants aux boutiques existantes et retire le nom des fiches produit ; lancé automatiquement par le conteneur).

**Espace publicitaire**
- 4 emplacements : bandeau d'accueil, haut du catalogue, fiche produit, bas du panier. Un emplacement sans publicité n'affiche rien et ne laisse aucun vide.
- Gestion dans l'admin Medusa, menu « Publicités » (barre latérale) : tableau de bord (en ligne, vues, clics, taux de clic), les 4 emplacements avec leur format conseillé et leur état (libre ou nombre en ligne), filtres par statut et emplacement, création et modification d'une publicité avec envoi du visuel depuis l'ordinateur (JPG, PNG, WebP ou GIF, 3 Mo) ou adresse d'image, aperçu, lien, dates de début et de fin facultatives, priorité (tirage pondéré entre plusieurs publicités), activation, suppression.
- Suivi par publicité : vues (comptées quand l'encart est réellement visible) et clics, avec le taux de clic. Les annonceurs et compteurs ne sont jamais exposés au public.
- Chaque encart porte la mention « Publicité » et le lien est en `rel="sponsored"`.
- Pistes pour plus tard : publicités par catégorie ou par boutique, facturation des annonceurs, rapports par annonceur.

**Mise à jour par-dessus un ancien dossier**
Dézippez de préférence dans un dossier vide (en gardant votre fichier `.env`). Si le zip a été copié par-dessus une ancienne version, d'anciens fichiers peuvent rester (par exemple `storefront/components/ProductCard.tsx`) : ils sont désormais ignorés par la construction Docker et par la vérification des types, mais vous pouvez les supprimer sans risque.

**Déploiement**
- Render : `render.yaml` et `RENDER.md` (base, API et vitrine en un clic depuis un dépôt Git).
- Coolify : `COOLIFY.md`. Local : `docker compose up --build`.
