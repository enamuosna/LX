# Déployer Lx sur Render

Render déploie depuis un dépôt Git. Le fichier `render.yaml` (à la racine) décrit tout : une base PostgreSQL, l'API avec l'administration (`lx-backend`) et la vitrine (`lx-storefront`).

## 1. Mettre le projet dans un dépôt Git
À la racine du dossier :
```bash
git init && git add . && git commit -m "Lx"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/lx.git
git push -u origin main
```
Le dépôt doit contenir `backend/`, `storefront/` et `render.yaml` à sa racine. Le fichier `.env` n'est jamais envoyé (exclu par `.gitignore`). Un dépôt privé fonctionne.

## 2. Créer les services
1. Sur render.com : **New +** puis **Blueprint**, connectez GitHub et choisissez le dépôt.
2. Render lit `render.yaml` et affiche 3 ressources : `lx-db`, `lx-backend`, `lx-storefront`.
3. Il vous demande une seule valeur : **`ADMIN_PASSWORD`**, le mot de passe de l'administrateur (choisissez-en un fort).
4. Cliquez sur **Apply**. Le premier déploiement dure 10 à 15 minutes (construction, migrations, données de démonstration).

## 3. Vérifier l'adresse de la vitrine
Dans le tableau de bord, ouvrez `lx-storefront` et lisez son adresse (par exemple `https://lx-storefront.onrender.com`).
Si elle est différente de `https://lx-storefront.onrender.com` (Render ajoute un suffixe quand le nom est déjà pris), ouvrez `lx-backend` > **Environment**, corrigez **`LX_STOREFRONT_URL`**, puis **Manual Deploy**. Cette adresse sert aux liens envoyés par WhatsApp.

## 4. Adresses
| Quoi | Adresse |
|---|---|
| Vitrine | adresse de `lx-storefront` |
| Administration (menu Lx et Publicités) | adresse de `lx-backend` + `/app` : `admin@lx.sn` et votre `ADMIN_PASSWORD` |
| Espace boutique | vitrine + `/vendor` : `boutique@lx.sn` / `ChangeMe!2026` (compte de démonstration, à changer) |

## 5. Réglages à faire ensuite
- **Numéro WhatsApp, frais de livraison** : `lx-backend` > Environment (`LX_WA_NUMBER`, `LX_DELIVERY_FEE`, et `LX_WA_TOKEN` / `LX_WA_PHONE_ID` pour l'envoi automatique via WhatsApp Business). Téléphone et e-mail affichés sur le site : variables `NEXT_PUBLIC_LX_PHONE` et `NEXT_PUBLIC_LX_EMAIL` de `lx-storefront`.
- **Nom de domaine** : dans chaque service, **Settings** > **Custom Domains**. Si vous changez l'adresse de la vitrine, mettez à jour `LX_STOREFRONT_URL` et redéployez le backend. Si vous changez celle du backend, redéployez les deux.
- **Compte boutique de démonstration** : changez son mot de passe ou supprimez-le depuis l'administration.

## Coûts et plans
`render.yaml` choisit des plans adaptés à une vraie mise en ligne. Les tarifs se consultent sur render.com/pricing.
- **Base `0.1c-256mb`** : payante, avec sauvegardes. Le plan `free` existe mais la base expire après 30 jours.
- **`lx-backend` `1c-2g`** : Medusa a besoin d'environ 1 Go de mémoire. Un disque persistant (5 Go) conserve les photos et les visuels publicitaires ; il impose un plan payant.
- **`lx-storefront` `0.5c-512mb`** : le plan `free` suffit pour un essai, mais le site se met en veille après 15 minutes sans visite (premier chargement d'environ une minute).

Pour un simple essai : base et vitrine en `free` (le backend reste payant à cause de la mémoire et du disque).

## Mises à jour
Chaque `git push` sur `main` redéploie automatiquement. Les migrations de base de données s'exécutent au démarrage du backend.

## Dépannage
- **Vitrine : « Backend Lx indisponible »** : le backend démarre encore (premier déploiement ou après une mise en veille). Regardez les **Logs** de `lx-backend`.
- **Administration : connexion impossible** : ouvrez bien l'adresse de `lx-backend` (https) + `/app`.
- **Images cassées après un changement d'adresse** : `BACKEND_PUBLIC_URL` suit l'adresse du backend ; redéployez le backend. Les photos de démonstration enregistrées avec une ancienne adresse sont à renvoyer.
- **Le déploiement du backend échoue sur la base** : vérifiez que `lx-db` et les deux services sont dans la même région (Francfort par défaut).
