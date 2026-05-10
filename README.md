# Florescence — Pokédex floral PACA (PWA)

Application Pokédex floral pour la région PACA. Identifie une fleur avec ton appareil photo (Pl@ntNet) → débloque la fiche du **genre** dans le Pokédex (938 fiches, 3970 espèces).

> Session 3 — refonte sur le pivot **Pokédex au niveau du genre** validé en test terrain Calanques (mai 2026).

## Contenu du dossier

- `index.html` — application single-file (4 vues : Accueil, Pokédex, Détail genre, Identifier ; drawer Réglages ; historique IndexedDB)
- `paca-flora.json` — 3970 espèces PACA (898 KB, patché S3 : +5 espèces, +1 nom FR, 10 alias taxonomiques)
- `paca-genera.json` — 938 fiches de genre dérivées (460 KB, 100% noms FR)
- `manifest.webmanifest` — PWA installable
- `service-worker.js` — Service Worker v2 : stale-while-revalidate, auto-cleanup des anciens caches
- `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` — icônes PWA
- `.nojekyll` — désactive Jekyll côté GitHub Pages

## Mise à jour (S3) — déploiement sur le repo existant

```bash
cd github-deploy
git add -A
git commit -m "Session 3 — Pokédex par genre v2 (938 fiches)"
git push origin main
```

Le Service Worker v2 (`CACHE_VERSION='florescence-v2-genus-2026-05-10-a'`) **invalide automatiquement** l'ancien cache `florescence-poc-v1` du POC S2 sur les téléphones déjà installés. La nouvelle version est prise en compte au prochain rechargement (skipWaiting + clients.claim).

## Premier lancement sur le téléphone

1. Ouvre <https://docteuriannotta.github.io/florescence-poc/> dans Chrome Android.
2. Engrenage haut droite : colle ta clé API Pl@ntNet (en mode **public** sur ton compte, sinon CORS), projet `weurope`. Enregistre — auto-save.
3. Tape **Identifier** sur l'accueil.
4. Installe via menu Chrome (⋮) → *Ajouter à l'écran d'accueil*.

## Les 4 vues

### 🏠 Accueil
- Un seul gros bouton **Identifier**. Suppression du toggle organes (S3 décision produit).
- Compteur Pokédex : `X / 938 genres`.
- Accès rapide Pokédex et Historique.

### 📖 Pokédex
- 938 cartes de genres avec nom FR limpide ("Coquelicots & Pavots", "Cistes", "Roses & Églantiers"…).
- Recherche fuzzy FR + latin (`coquelicot`, `papaver`, `papavéracée` matchent).
- Filtres : Tous / Découverts / 🌊 Calanques / 🟢 🔵 🟠 🔴 par rareté / 👑 Légendaires / ⭐ Endémiques.
- Carte Pokédex débloquée (`unlocked`) au top 1 d'une identification réussie.

### 📷 Identifier
- Capture jusqu'à 5 photos, compression client (1200px, JPEG q=0.85).
- POST multipart vers `my-api.plantnet.org/v2/identify/{project}`, `organs=auto`.
- Top 3 affiché avec score Pl@ntNet, badge PACA, statut, Calanques.
- **Bouton "Ouvrir la fiche : <Nom FR du genre> →"** sur chaque résultat → fiche genre + sous-listing espèces avec l'espèce identifiée surlignée.
- Boost +20% PACA dispo dans réglages, **off par défaut** (S3) pour comparer la précision brute.

### 📑 Détail genre
- Hero : nom FR usuel + latin + famille + statut + badges (Calanques, légendaire, endémique, découvert).
- Stats : nombre d'espèces PACA / Calanques / endémiques.
- À propos : description synthétique.
- Sous-listing complet des espèces PACA, l'espèce identifiée surlignée vert.

### ⏱ Historique (IndexedDB)
- Chaque identification stocke : timestamp, thumbnail (100×100 jpeg), genre identifié, espèce, score, flag PACA.
- Tap sur une entrée → ouvre la fiche genre.

## Patches Session 3

### Données (`paca-flora.json` v1.1 → 3970 espèces)
- ✅ Ajout : Aphyllanthes monspeliensis, Teucrium polium, Dorycnium pentaphyllum, Centaurea corymbosa, Salvia argentea
- ✅ Complétion FR : Teucrium chamaedrys
- ✅ 10 alias taxonomiques embarqués (Rosmarinus officinalis ↔ Salvia rosmarinus, Lotus dorycnium ↔ Dorycnium pentaphyllum, Lithodora fruticosa ↔ Glandora fruticosa, …)

### Dérivé (`paca-genera.json` v1.0 → 938 genres)
- 938 / 938 noms FR de genre (100%) :
  - 702 curés manuellement à la main (libellés grand-public type "Coquelicots & Pavots")
  - 236 dérivés algorithmiquement depuis le nomFr de l'espèce-type, pluralisé
  - 0 fallback latin
- Pour chaque genre : speciesCount, calanquesCount, endemicCount, statutDominant, statutMin, speciesEmblematique, speciesIds
- Tri par rareté décroissante puis Calanques d'abord puis ordre alphabétique FR

### Service Worker v2
- `CACHE_VERSION='florescence-v2-genus-2026-05-10-a'` (versioned, à bumper à chaque deploy)
- `activate` : cleanup auto de **tous** les caches qui ne sont pas la version courante (élimine `florescence-poc-v1`)
- Stratégie stale-while-revalidate : sert le cache instantanément, revalide réseau en arrière-plan
- `skipWaiting` + `clients.claim` : la mise à jour est prise en compte sans devoir tuer l'app
- Bypass Pl@ntNet (toujours réseau)

### UX
- Single bouton Identifier (suppression toggle organes)
- Boost +20% PACA off par défaut (déplacé dans réglages)
- Auto-save de la clé API sur `input` event (fix B4 du handoff S2)
- Reset progression Pokédex disponible dans réglages

## Erreurs Pl@ntNet gérées

| Code | Message utilisateur |
| --- | --- |
| 401 / 403 | Clé API invalide / refusée — réouverture réglages, vérifier mode "public" |
| 404 | Aucune espèce identifiée — invitation à recadrer/ajouter photo |
| 413 | Image trop lourde |
| 429 | Quota Pl@ntNet épuisé |
| 5xx | Panne serveur Pl@ntNet |
| AbortError | Timeout 30 s |

## Limites connues / à reprendre en S4-S5

- Description du genre = phrase synthétique générée à partir des stats. À enrichir Wikipedia FR en S5.
- Pas encore de photo représentative par genre (S5).
- Carte de répartition régionale/nationale = data brute Calanques + endemic. Carte vectorielle PACA + France à venir S5.
- Boost PACA est binaire ; on pourrait moduler selon la fréquence (occurrences) des espèces.
- Sous-page espèce spécifique pour les genres très diversifiés (Rosa, Hieracium…) : différé.

## Sécurité

- Clé API en `localStorage`. Doit être en `public` sur le compte Pl@ntNet (sinon CORS bloque).
- Aucun backend, aucune télémétrie, zéro dépendance JS externe.

## Versions

- v2.0 — 10 mai 2026 — Session 3 (Pokédex par genre, 938 fiches)
- v1.0 — 9 mai 2026 — Session 2 (POC Pl@ntNet)

## Références

- Pl@ntNet API : <https://my.plantnet.org/doc/openapi>
- Source PACA : GBIF (gadmGid=FRA.13_1)
- Polygone Calanques : `POLYGON((5.30 43.18, 5.55 43.18, 5.55 43.27, 5.30 43.27, 5.30 43.18))`
