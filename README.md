# Florescence — POC Pl@ntNet (PWA)

POC de Session 2 : identification de plantes via Pl@ntNet, cross-référencée avec la base PACA (3965 espèces, livrable de Session 1).

## Contenu du dossier

- `index.html` — application single-file (mobile-first, dark mode)
- `paca-flora.json` — base PACA 3965 espèces (1.3 MB)
- `manifest.webmanifest` — PWA installable
- `service-worker.js` — cache offline du shell + base PACA (Pl@ntNet reste online-only)
- `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` — icônes PWA
- `.nojekyll` — désactive Jekyll côté GitHub Pages

## Mise en ligne sur GitHub Pages (3 minutes)

1. Crée un repo public sur GitHub, par ex. `florescence-poc`.
2. Pousse le contenu de ce dossier à la **racine** du repo :
   ```bash
   cd github-deploy
   git init
   git add .
   git commit -m "POC Pl@ntNet PWA"
   git branch -M main
   git remote add origin git@github.com:<TON_USER>/florescence-poc.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Build and deployment**
   - Source : `Deploy from a branch`
   - Branch : `main` / `(root)`
   - Save.
4. Au bout d'environ 1 minute, l'app est en ligne sur :
   `https://<TON_USER>.github.io/florescence-poc/`

## Premier lancement sur le téléphone

1. Ouvre l'URL ci-dessus dans **Chrome Android** (HTTPS requis pour la caméra).
2. Tape l'engrenage en haut à droite, colle ta clé API Pl@ntNet, choisis le projet `weurope`. Enregistre.
3. Le bandeau bas indique `✅ Base PACA chargée : 3965 espèces (1174 Calanques)`.
4. **Installe l'app** : menu Chrome (⋮) → *Ajouter à l'écran d'accueil*. Une icône Florescence apparaît, tu peux lancer l'app comme une vraie appli Android.
5. Une fois ouverte une première fois en wifi/4G, le service worker met `index.html` + `paca-flora.json` en cache. **L'app reste utilisable hors-ligne** ; seul l'appel à Pl@ntNet (l'identification) nécessite du réseau.

## Mode d'emploi terrain

1. **Bouton 📷 Prendre une photo** → ouvre la caméra arrière directement.
2. Possibilité d'ajouter jusqu'à **5 photos** pour la même requête (Pl@ntNet est plus précis avec plusieurs angles / organes).
3. **Toggle organe** : auto, fleur, feuille, fruit, écorce. L'organe choisi est appliqué à toutes les photos. *Auto* laisse Pl@ntNet décider.
4. **🔎 Identifier** : compresse les photos (max 1200 px, qualité 0.85) puis POST multipart vers `https://my-api.plantnet.org/v2/identify/{projet}`.
5. **Top 3** affiché avec scores, badges PACA / Calanques / statut / endémique / hors-PACA.
6. **Boost PACA** (réglages) : si activé, +20% de score pour les espèces présentes dans `paca-flora.json` → réordonnage.
7. **🗑 Reset** vide les photos et la zone résultats.

## Erreurs gérées

| Code | Message utilisateur |
| --- | --- |
| 401 / 403 | Clé API invalide — réouverture des réglages |
| 404 | Aucune espèce identifiée — invitation à recadrer ou ajouter une photo |
| 413 | Image trop lourde (rare après compression) |
| 429 | Quota Pl@ntNet épuisé pour la journée |
| 5xx | Panne serveur Pl@ntNet |
| AbortError | Timeout réseau 30 s (4G faible Calanques ?) |

## Sécurité

- La clé API Pl@ntNet est stockée en `localStorage` du navigateur, jamais transmise ailleurs que vers `my-api.plantnet.org`.
- Aucun backend, aucune télémétrie, aucune dépendance JS externe.

## Limites connues (à traiter en sessions suivantes)

- `nomFr` est `null` ou `"/"` pour ~20% des espèces PACA (couverture partielle GBIF) — l'UI tombe sur le latin.
- Les espèces arborescentes (chêne vert, olivier, pin…) sont **filtrées hors de paca-flora.json** (choix de design Session 1) → elles seront classées "hors-PACA" même si on les voit partout. À expliquer à l'utilisateur final en Session 3.
- Le cross-ref se fait par nom latin canonique (Genus + species). Les sous-espèces Pl@ntNet sont normalisées vers leur espèce parente.

## Versions

- v1 — 9 mai 2026 (Session 2 Florescence)
- Base : `paca-flora.json` v1.0 du 9 mai 2026 (Session 1)

## Références

- Pl@ntNet API : <https://my.plantnet.org/doc/openapi>
- Source PACA : GBIF (gadmGid=FRA.13_1)
- Polygone Calanques : `POLYGON((5.30 43.18, 5.55 43.18, 5.55 43.27, 5.30 43.27, 5.30 43.18))`
