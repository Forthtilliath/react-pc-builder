# Pistes d'amélioration — PC Builder

Liste des améliorations possibles identifiées en relisant le code actuel. Rien n'est urgent ni demandé explicitement — c'est une liste d'idées à piocher selon les besoins réels. (Le détail de ce qui a déjà été fait vit dans l'historique git, pas ici.)

## Compatibilité

- [x] **PSU ↔ boîtier (format ATX/SFX)** : le boîtier vérifie déjà les formats de carte mère et la hauteur de ventirad, mais pas si l'alimentation elle-même rentre dedans. Certains boîtiers compacts n'acceptent que du SFX/SFX-L. Ajouter un champ `psuFormFactor` (alimentation) + `supportedPsuFormFactors` (boîtier) permettrait un vrai check, sur le même modèle que le format de carte mère.
- [x] **AIO ↔ boîtier (taille radiateur)** : le refroidissement distingue maintenant Air/AIO avec une taille de radiateur (120/240/280/360mm) pour les AIO, mais le boîtier n'a pas encore de champ "tailles de radiateur supportées" — donc pas de vrai check de compatibilité pour un AIO, juste la saisie des specs.

## Confort d'usage

- [x] **Sections repliables** : la page affiche en permanence 14 catégories, dont plusieurs optionnelles rarement utilisées (switch KVM, bras d'écran...). Un accordéon (replié par défaut si vide) réduirait le scroll, surtout maintenant que la nav latérale existe pour sauter directement à une section.
- [x] **Undo après suppression** : la confirmation avant suppression évite les accidents, mais un vrai filet de sécurité serait un toast "Supprimé — Annuler" (quelques secondes) plutôt qu'un blocage systématique par `window.confirm`. On a déjà l'infra toast (`ToastProvider`) pour ça.

## Qualité de code

- [x] **Tests de composants** : les tests actuels couvrent la logique pure (`compatibility.ts`, le reducer, les migrations) mais rien sur le rendu réel — la sélection multi-groupe dans l'UI, le formulaire, le tri/filtre. Ajouter `@testing-library/react` + un environnement DOM permettrait de couvrir ces interactions.
- [x] **Accessibilité de la modale Résumé** : pas de piège de focus ni de fermeture au clavier (Échap) actuellement sur `BuildSummary`.
