# Pistes d'amélioration — PC Builder

Liste des améliorations possibles identifiées en relisant le code actuel. Rien n'est urgent ni demandé explicitement — c'est une liste d'idées à piocher selon les besoins réels.

## Fiabilité des données (localStorage)

- [ ] **Export / import JSON** : bouton pour télécharger un backup de `pc-builder:options` et le réimporter. Aujourd'hui, un `localStorage.clear()` accidentel ou un changement de navigateur fait tout perdre.
- [ ] **Confirmation avant suppression** : le bouton corbeille supprime immédiatement une version, sans confirmation ni undo. Un `window.confirm` ou une modale légère éviterait une suppression accidentelle irréversible.
- [ ] **Migration de schéma** : plusieurs champs de specs ont changé de type pendant cette conversation (`connectorType` et `vesaFormat` sont passés de `string` à `string[]`). Les anciennes données stockées avec l'ancien format ne sont pas migrées — elles s'afficheraient mal (`formatSpecValue` gère les tableaux, mais une vieille string simple resterait affichée telle quelle au lieu d'une liste). Un petit versioning du schéma localStorage + migration simple éviterait ce genre de résidu silencieux à chaque évolution du modèle.
- [ ] **Sync multi-onglets** : si l'app est ouverte dans deux onglets, les changements de l'un n'apparaissent pas dans l'autre sans rechargement (pas d'écoute de l'event `storage`).

## Compatibilité

- [ ] **RAM ↔ carte mère** : vérifier le nombre de barrettes/capacité totale vs le nombre de slots et la capacité max supportée par la carte mère (aucun champ `ramSlots`/`maxRamCapacity` n'existe encore).
- [ ] **Ventirad ↔ boîtier** : on a la longueur GPU max du boîtier, mais pas la hauteur max de ventirad (visible sur la fiche MSI Forge 100M : "CPU Cooler Length: up to 160mm"). Ajouter `coolerHeightMm` (refroidissement) et `maxCoolerHeightMm` (boîtier) permettrait un vrai check.
- [ ] **VESA écran ↔ bras d'écran** : le bras a un champ `vesaFormat`, mais pas l'écran lui-même. Sans ce champ côté écran, impossible de vérifier réellement la compatibilité (aujourd'hui c'est juste déclaratif sur le bras).
- [ ] **Marge de sécurité PSU configurable** : `PSU_SAFETY_MARGIN = 1.2` est en dur dans `compatibility.ts`. Pourrait devenir un réglage utilisateur (certains préfèrent une marge plus large).

## Sélection multi-composants

- [ ] **Stockage multiple** : le modèle actuel ne permet qu'un seul stockage sélectionné, alors qu'un build réel a souvent un NVMe + un SATA. Le pattern "regroupement + sélection unique par groupe" qu'on vient d'ajouter pour "Autre" pourrait s'appliquer au stockage (groupé par type M.2/SATA), en autorisant plusieurs sélections simultanées.

## Fonctionnalités

- [ ] **Budget cible** : afficher un objectif de budget et le reste à dépenser, en plus du total actuel.
- [ ] **Statut "acheté"** : distinguer "sélectionné pour comparaison" de "réellement acheté", pour suivre l'avancement des achats dans le temps.
- [ ] **Historique de prix** : possibilité d'ajouter des points de prix dans le temps sur une même version (utile vu que tu regardes des graphiques d'historique Amazon/CamelCamelCamel) pour repérer une bonne affaire.
- [ ] **Image/miniature** : un champ URL d'image par version aiderait à identifier visuellement les options quand il y en a beaucoup.
- [ ] **Tri / filtre** : trier les versions par prix, filtrer sur "sélectionné uniquement", ou rechercher par nom dans les catégories qui ont beaucoup d'entrées.
- [ ] **Vue résumé/export** : une vue lecture seule (ou export PDF/image) du build final avec le total, utile pour partager ou demander un avis.
- [ ] **Score de complétude** : un indicateur du style "6/9 catégories obligatoires choisies, 0 alerte" en un coup d'œil, en plus de la liste "encore à choisir".

## Qualité de code

- [ ] **Tests unitaires** : `compatibility.ts` (règles de compat) et le reducer de `build-context.tsx` (surtout la logique de sélection par groupe qu'on vient d'ajouter) sont de la vraie logique métier sans aucun test — un changement futur pourrait casser silencieusement une règle.
- [ ] **Typage des specs dynamiques** : `option-form.tsx` utilise plusieurs `as any` pour assigner les valeurs de specs dynamiquement (`formValuesToSpecs`). Fonctionnel mais pas typé strictement ; un mapping par type de champ éviterait ces échappatoires si le modèle continue de grossir.

## Confort d'usage

- [ ] **Import rapide depuis une fiche produit** : coller une URL ou un texte de fiche produit (Amazon, LDLC, etc.) et préremplir automatiquement nom/prix/specs. Gros gain de temps vu le nombre de composants déjà saisis à la main, mais nécessiterait soit un parsing fragile, soit une aide manuelle (comme on l'a fait dans cette conversation).
