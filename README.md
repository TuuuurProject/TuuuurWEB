# Tuuuur Web

## Interface gaming

Le client Vue propose un accueil responsive avec trois modes existants (solo,
groupe et duel classé), une navigation clavier/mobile et un accès au classement.
La direction visuelle repose sur un fond bleu nuit, des accents citron/lavande,
des cartes en relief et une scène de connaissances originale.

- La scène utilise six faces CSS 3D, sans WebGL, modèle téléchargé ni dépendance
  supplémentaire. Les illustrations des modes sont également réalisées en CSS.
- Les animations d'entrée se terminent en moins de deux secondes ; les effets
  de survol sont réservés aux pointeurs précis. `prefers-reduced-motion` supprime
  les animations décoratives et les déplacements de survol.
- Les textes sont disponibles en français et en anglais. Le sélecteur de langue
  natif est utilisable au clavier et mémorise le choix.
- Le solo conserve ses règles et contrats API : la refonte ajoute une progression
  de manches, des réponses plus lisibles et des indicateurs correct/incorrect
  qui ne reposent pas uniquement sur la couleur.
- Aucun défi quotidien, inventaire, solde ou nombre de joueurs fictif n'est affiché.

Les styles partagés et responsive se trouvent dans
[`src/assets/arena.css`](./src/assets/arena.css), les illustrations dans
[`src/components/gaming`](./src/components/gaming) et les traductions dans
[`src/locales`](./src/locales).

### Vérification ciblée de l'interface

```sh
npm run build
npm run test:unit -- --run src/components/gaming/arena.spec.ts
npm run e2e:run
```

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
