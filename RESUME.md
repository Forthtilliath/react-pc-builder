# Résumé de la conversation — PC Builder

## Demande initiale

Créer un outil pour piloter l'achat d'un nouveau PC, permettant de :
- gérer l'ensemble des composants (nom, prix, lien où trouver, date)
- garder plusieurs "versions" d'un même composant pour les comparer facilement
- afficher le montant total en temps réel des composants sélectionnés
- vérifier facilement la compatibilité entre les composants choisis

Question posée en premier : dans quel langage faire ce projet ? → réponse React (stack JS/TS), confirmée par l'utilisateur.

## Décisions prises (via questions posées avant l'implémentation)

- **Emplacement** : `D:\projects\react-pc-builder`
- **Stockage** : localStorage uniquement, pas de backend (outil mono-utilisateur, mono-machine)
- **Compatibilité** : règles automatiques de base (pas une simple checklist manuelle)
- **Stack technique** : alignée sur les autres projets React de l'utilisateur (ex. `react-aeonsend-randomizer`) : Vite + React 19 + TypeScript, Tailwind CSS v4, Biome (lint/format), Bun

## Ce qui a été implémenté

- **Scaffold du projet** : `package.json`, `vite.config.ts`, `tsconfig*.json`, `biome.jsonc`, `index.html`, `.gitignore`
- **Modèle de données** (`src/types/component.ts`) : catégories fixes (CPU, GPU, carte mère, RAM, stockage, alimentation, boîtier, refroidissement, autre), avec specs typées par catégorie (socket, type RAM, format, TDP, wattage, longueur GPU, etc.)
- **Métadonnées de catégories** (`src/data/categories.ts`) : label et champs de spec à afficher par catégorie
- **Persistance** : hook générique `useLocalStorage` (`src/hooks/use-local-storage.ts`) + `BuildContext` (`src/context/build-context.tsx`) exposant les actions `addOption`, `updateOption`, `deleteOption`, `duplicateOption` (pour créer rapidement une variante à comparer) et `selectOption` (une seule sélection par catégorie)
- **Règles de compatibilité** (`src/utils/compatibility.ts`), chacune renvoyant `ok | warning | error | info` :
  1. Socket CPU ↔ carte mère
  2. Type de RAM ↔ carte mère
  3. Format de la carte mère ↔ formats supportés par le boîtier
  4. Wattage de l'alimentation ↔ (TDP CPU + TDP GPU) × marge de sécurité 1,2
  5. Longueur du GPU ↔ longueur GPU max du boîtier
- **UI** : `category-section.tsx`, `option-card.tsx`, `option-form.tsx` (formulaire avec champs dynamiques selon la catégorie), `total-bar.tsx` (total live + catégories manquantes), `compatibility-panel.tsx` (icônes ✅/⚠️/❌/ℹ️)
- **Assemblage** : `app.tsx` / `main.tsx`, styles Tailwind

## Vérifications effectuées

- `bun install` : dépendances installées (avec l'override `vite` → `npm:rolldown-vite@7.2.5`, requis par `@vitejs/plugin-react@6.x`)
- `bun run lint` (Biome) : propre, aucune erreur
- `tsc -b` : aucune erreur de typage
- `bun run dev` : serveur démarré, page HTML/JS servie sans erreur (HTTP 200)
- **Non fait** : test visuel dans un vrai navigateur (pas d'outil de pilotage navigateur disponible dans cet environnement) — à faire manuellement via `bun run dev` puis http://localhost:5173

## Pour reprendre le projet

```bash
cd D:\projects\react-pc-builder
bun install
bun run dev
```

Aucun composant n'est encore saisi — le fichier de données est vide au premier lancement (localStorage).
