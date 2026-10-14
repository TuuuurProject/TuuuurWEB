# Monkizz Web

Client Vue 3 / Vite du quiz de culture generale Monkizz. Les modes solo, groupe et competitif utilisent l'API existante.

## Developpement

```sh
npm ci
npm run dev
npm run build
npm run test:unit -- --run
```

Les URL d'API et les identifiants de connexion sont fournis par les variables `VITE_*` de l'environnement ; ne jamais y placer de secret. Les parcours de test navigateur utilisent `npm run e2e:run`.

## Identite visuelle

- Signature : curieux, joueur et accessible ; logo singe geometrique cree pour Monkizz (`src/assets/monkizz-mark.svg`).
- Typographie : Space Grotesk pour titres, chiffres et actions ; DM Sans pour le texte et les questions. Les polices ont des fallbacks systeme et sont chargees depuis Google Fonts dans `index.html`.
- Palette claire : fond creme `#F7F6F1`, encre `#1D2539`, indigo `#353779`, corail `#C64630`, vert `#10735E`.
- Palette sombre : fond nuit `#111827`, texte ivoire `#F6F6F1`, indigo doux `#B6B7FF`, corail `#FFA080`, menthe `#87DDB7`.
- Les tokens des deux themes sont dans `src/assets/base.css` et exposes aux utilitaires Tailwind par `tailwind.config.js`. Le choix clair/sombre est conserve dans `localStorage` sous `monkizz-theme` ; sans preference enregistree, il suit le theme du systeme au premier chargement.
- Le mouvement reduit est respecte via `prefers-reduced-motion`. Les composants de jeu doivent privilegier les tokens semantiques plutot que des couleurs codees en dur.
