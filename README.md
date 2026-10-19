# Monkizz Web

## Interface gaming — jungle arcade

Le client Vue propose un accueil responsive avec trois modes existants (solo,
groupe et duel classé), une navigation clavier/mobile et un accès au classement.
Monkizz est le nouveau nom public du jeu ; les chemins des projets et les contrats
API Tuuuur sont conservés. La direction visuelle associe fond nuit, vert citron,
violet, cartes en relief et **Moki**, un singe original avec casquette de travers,
hoodie, grandes oreilles, langue tirée et banane-téléphone.

- L'accueil affiche un véritable modèle **3D WebGL2 / Three.js**, construit
  avec des volumes et courbes dans [`monkeyModel.ts`](./src/components/gaming/monkeyModel.ts).
  Aucun modèle, texture ou service 3D distant n'est utilisé. Éclairage, ombres
  et podium sont gérés dans [`monkeyScene.ts`](./src/components/gaming/monkeyScene.ts).
- Les boutons permettent de tourner Moki et de déclencher sa réaction
  « Fais le singe ! » avec une réplique. Ils sont accessibles au clavier et au
  toucher. La scène possède une description FR/EN ; le canvas est décoratif.
- Three.js est chargé à la demande dans un chunk séparé. Le rendu se fait
  uniquement au redimensionnement ou pendant une interaction, pas en boucle
  permanente. Il est suspendu hors écran et dans un onglet masqué ; géométries,
  matériaux, renderer et observateurs sont libérés à la sortie de l'accueil.
- Sans WebGL2, en cas d'échec du chargement ou de perte du contexte graphique,
  une illustration SVG assortie et un statut explicite prennent le relais.
  Le jeu reste accessible. Cette illustration sert aussi au logo, au mode groupe
  et à la connexion ; ses identifiants de dégradés sont uniques par instance.
- Les boutons ouvrent les vrais parcours existants. Le bandeau des thèmes est
  illustratif ; la sélection du quiz reste dans le mode solo. La section
  « Comment jouer » explique les trois étapes sans simuler une partie.
- La réaction 3D dure moins de deux secondes, uniquement sur commande.
  `prefers-reduced-motion` supprime cette animation et rend la rotation
  instantanée, tout en conservant la réplique. Les effets de survol des cartes
  sont réservés aux pointeurs précis.
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
npm run test:unit -- --run src/components/gaming/arena.spec.ts src/components/gaming/Monkey3D.spec.ts src/components/gaming/monkeyModel.spec.ts
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
