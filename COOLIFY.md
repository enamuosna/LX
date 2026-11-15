# Déployer Lx sur Coolify

Coolify déploie depuis un dépôt Git : il faut donc d'abord mettre ce dossier dans un dépôt (GitHub/GitLab/Gitea).

## 1. Dépôt Git
À la racine du dépôt : `backend/`, `storefront/`, `docker-compose.coolify.yml`, `docker-compose.yml`.
Ne commitez jamais `.env` (déjà exclu).

## 2. Créer la ressource
1. Coolify → **Projects** → votre projet → **+ New Resource** → votre dépôt (GitHub App / Deploy Key / public).
2. **Build Pack : Docker Compose** · **Base Directory : `/`** · **Docker Compose Location : `/docker-compose.coolify.yml`**.
3. Cliquez sur **Reload Compose File** : Coolify détecte 3 services (`db`, `backend`, `storefront`).

## 3. Domaines (onglet de chaque service)
- **storefront** → domaine de la vitrine, ex. `https://lx.votredomaine.com` (port 3000)
- **backend** → domaine de l'API et de l'admin, ex. `https://api.lx.votredomaine.com` (port 9000)
- Créez les deux enregistrements DNS (type A) vers l'IP du serveur Coolify. Sans domaine, Coolify génère des adresses `sslip.io` utilisables pour tester.

## 4. Variables d'environnement
Obligatoire : **`ADMIN_PASSWORD`** (mot de passe de l'administrateur). Optionnelles : `ADMIN_EMAIL` (défaut `admin@lx.sn`), `LX_DELIVERY_FEE`, `LX_PHONE`, `LX_EMAIL`, `LX_WA_TOKEN`, `LX_WA_PHONE_ID`, `LX_WA_NUMBER`.
Les mots de passe PostgreSQL et les secrets JWT/cookies sont générés automatiquement par Coolify.

## 5. Déployer
Cliquez **Deploy**. Premier déploiement : 5 à 10 min (build + migrations + données de démonstration). Le backend est « healthy » quand l'API répond.

| Quoi | Adresse |
|---|---|
| Vitrine | domaine de **storefront** |
| Admin Medusa (menu Lx) | domaine de **backend** + `/app` : `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| Espace boutique | vitrine + `/vendor` : `boutique@lx.sn` / `ChangeMe!2026` |

## 6. Après le premier test
- Changez le mot de passe du compte boutique de démonstration (ou supprimez-le).
- Si vous **changez un domaine après le premier déploiement** : redéployez (les CORS et l'URL des images en dépendent) ; les images des produits de démo, enregistrées avec l'ancienne adresse de la vitrine, ne s'afficheront plus (recréez-les ou repartez d'une base vide).
- Sauvegardes : activez les backups du volume PostgreSQL dans Coolify.

## Dépannage
- **Vitrine : « Backend Lx indisponible »** → le backend n'est pas encore healthy : attendez, puis regardez les logs du service `backend`.
- **Admin : connexion impossible** → vérifiez que le domaine du backend est en HTTPS et que `ADMIN_CORS` (affiché dans les variables) correspond exactement à l'adresse utilisée.
- **Images cassées** → `BACKEND_PUBLIC_URL` doit être l'adresse publique du backend ; redéployez après tout changement de domaine.
