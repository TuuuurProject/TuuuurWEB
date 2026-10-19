# Monkizz Web

## Interface gaming — jungle arcade

Le client Vue propose un accueil responsive avec trois modes existants (solo,
groupe et duel classé), une navigation clavier/mobile et un accès au classement.
Monkizz est le nouveau nom public du jeu ; les chemins des projets et les contrats
API Tuuuur sont conservés. La direction visuelle associe fond nuit, vert citron,
violet, cartes en relief et une mascotte singe originale avec casque et hoodie.

- La mascotte est une illustration SVG originale en **2,5D** (dégradés et ombres),
  pas un modèle 3D. Elle est partagée entre logo, accueil, mode groupe et invitation
  à se connecter. Les identifiants de dégradés sont uniques par instance.
- Le décor associe un îlot en relief et un cube à six faces **CSS 3D**, sans WebGL,
  modèle téléchargé ni dépendance supplémentaire. Les éléments sont décoratifs,
  non focalisables et ne bloquent jamais le jeu.
- Les boutons ouvrent les vrais parcours existants. Le bandeau des thèmes est
  illustratif ; la sélection du quiz reste dans le mode solo. La section
  « Comment jouer » explique les trois étapes sans simuler une partie.
- Les animations d'entrée se terminent en moins de deux secondes ; les effets
  de survol sont réservés aux pointeurs précis. `prefers-reduced-motion` supprime
  les animations décoratives et les déplacements de survol.
- Les textes sont disponibles en français et en anglais. Le sélecteur de langue
  natif est utilisable au clavier et mémorise le choix.
- Le solo conserve ses règles et contrats API : la refonte ajoute une progression
  de manches, des réponses plus lisibles et des indicateurs correct/incorrect
  qui ne reposent pas uniquement sur la couleur.
- Aucun défi quotidien, inventaire, solde ou nombre de joueurs fictif n'est affiché.
- Le titre du navigateur, le favicon, la navigation et les textes FR/EN portent
  la marque Monkizz. Cette refonte concerne le web responsive, pas le client Flutter.

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

Le script `e2e:run` lance tous les scénarios. Pour cibler uniquement l'interface,
lancer `npm run dev:e2e` puis, dans un autre terminal :

```sh
npx cypress run --spec cypress/e2e/05-gaming-ui.cy.ts
```

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
