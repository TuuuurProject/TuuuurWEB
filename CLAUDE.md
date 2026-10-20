# Front Monkizz (ex-« Tuuuur »)

Jeu de quiz (1 question, 4 réponses) : solo, groupe temps réel, duel classé 1v1 avec ELO, historique, classement.
**Le jeu s'appelle désormais Monkizz.** Côté front le nom est appliqué (titre, header en texte « Monk**izz** », locales, clé `monkizz_active_group`). L'API garde « Tuuuur » (`Tuuuur.sln`). `src/assets/logo.png` (singe néon « Tuuuur ») n'est plus affiché, gardé en attendant la mascotte.
Mascotte singe : modèle 3D `src/assets/models/monkey.glb` (Mixamo riggé, Draco + textures WebP, animations `Victory`, `Defeat`, `Walking`) rendu par three.js. `components/mascot/MonkizzMascot.vue` (props `size` = largeur px, format 5:6, `pose` = victory | defeat | walking, `animated`) charge à la demande `mascotScene.ts` (chunk séparé, modèle mis en cache et cloné par instance, rendu suspendu hors écran, pose figée si « réduire les animations »). Victoire et défaite sont jouées une fois puis rejouées toutes les 5 s. Décodeur Draco copié dans `public/draco/gltf/` (le chemin intégré à three casse en dev avec le pré-bundling Vite) : le recopier depuis `node_modules/three/examples/jsm/libs/draco/gltf/` à chaque mise à jour de three. Si WebGL ou le chargement échouent, `MonkizzMascotFallback.vue` (ancien singe SVG) prend le relais. `MascotSpeech` = bulle + mascotte ; `GameResults` choisit victoire ou défaite selon le résultat.
Refonte en cours (branche `newDa`) : DA grand public mais compétitive (pas enfantine), mode clair + sombre, puis nouveaux layouts page par page. Pistes explorées : `../design/pistes-da.html` ; retenue : variante 3 « Évolution » (palette et polices actuelles, sans néon). On évite de copier GeoGuessr (référence d'esprit seulement).
Avancement des layouts : **Accueil fait** (hero avec « Jouer en solo » / « Jouer entre amis » ; à droite la mascotte et une bulle sur la dernière partie si connecté, sinon un exemple de question, cartes des 3 modes, bloc « Votre progression » Élo / rang / dernière partie si connecté, sinon invitation à créer un compte). **Parcours de jeu fait** : sélection (solo + hôte de groupe), question et résultats mutualisés entre solo, groupe et classé via `components/game/` (voir Architecture) ; la mascotte commente la fin de partie ; plus de modale de confirmation avant une partie solo. **Groupe fait** : l'écran groupe présente « Créer » et « Rejoindre » côte à côte (saisie du code intégrée, `GroupJoin` n'a plus d'écran à lui ni d'événement `back`) ; le salon (`GroupLobby`) affiche en haut le code, le QR, le lien à copier, les joueurs (hôte, expulsion) et le bouton de lancement, puis les réglages passés en slot (`GroupCreate`). Plus de modale de confirmation au lancement. **Duel classé fait** : écran de lancement (`OnlineMode`, étape idle : Élo + rang, règles, mascotte + bouton de recherche placé en premier sur mobile) et `RankedMatchmaking` en face-à-face joueur / adversaire (place vide qui respire + temps de recherche, puis adversaire trouvé). Le radar néon a été supprimé. **Classement et profil faits** : `Leaderboard` = podium (`ResultsPodium` avec `unit`) + carte « Votre position » ; profil = carte joueur (avatar cliquable, pseudo modifiable, Élo, actions du compte, suppression en lien discret) + historique (filtres en segments, une ligne par partie, pagination précédente / suivante). **Header et auth faits** : header avec liens directs (Solo, En groupe, Duel classé, Classement, lien actif surligné), langue compacte (FR/EN), thème, avatar + pseudo vers le profil ou « Se connecter » (masqué sur les pages d'auth), panneau mobile sous 1024 px ; `ModeSwitcher` supprimé. Auth : gabarit `auth/AuthLayout` (mascotte à gauche sur grand écran + carte formulaire), `FieldRules` pour les règles de pseudo/mot de passe, champs en classes `.field-label` / `.field-input` / `.form-error` / `.text-link` / `.code-digit` (base.css). **Toutes les pages ont été refondues.**
L'API .NET est dans `../api` (référence uniquement, on ne la modifie pas sauf demande).

## Stack

- Vue 3.5 (`<script setup lang="ts">` majoritaire), Vite 7, TypeScript 5.9, vue-tsc 3
- Pinia 3 + `pinia-plugin-persistedstate` (seul `user` est persisté : token, refreshToken, comeFrom)
- Vue Router 4, vue-i18n 11 (Composition API, `fr` par défaut, `en` en fallback, locale dans `localStorage.locale`)
- Tailwind **3.4** (pas v4, migration possible plus tard) + PostCSS, Font Awesome (icônes enregistrées une par une dans `src/main.ts` → toute nouvelle icône doit y être ajoutée)
- SignalR (`@microsoft/signalr`, transport LongPolling), axios, dayjs (locale fr), vue3-toastify (thème synchronisé avec le mode clair/sombre), vue3-google-login, qrcode
- Tests : Vitest 5 (jsdom, aucun test unitaire écrit pour l'instant), Cypress + MSW (`src/mocks/*`, mode `e2e`)

## Commandes

Lancer l'app : `npm run dev` (API attendue sur `localhost:8080`, cf. `.env.local`). Sans API, `npm run dev:e2e` lance l'app avec les mocks MSW (partie solo jouable de bout en bout ; groupe et classé impossibles sans SignalR) ; pour être connecté en mock, poser dans `localStorage['user-store']` un token créé par `createMockToken()` de `src/mocks/data/user.ts`. Configs `web` / `web-mock` dans `../.claude/launch.json`.

```bash
npm run dev          # Vite
npm run build        # type-check + build
npm run type-check   # vue-tsc --build
npm run lint         # eslint --fix
npm run format       # prettier src/
npm run e2e:run      # Cypress headless avec MSW (port 5173 doit être libre, mode e2e)
```

Env : `VITE_API_URL` (base REST, se termine par `/`… les stores concatènent directement `'solo'`, `'me'`, etc.), `VITE_BASE_API_URL` (base des hubs SignalR `group` / `ranked`), `VITE_GOOGLE_CLIENT_ID`, `VITE_DEBUG_CONSOLE_LOG`.

## Architecture

```
src/
  main.ts            bootstrap : MSW si e2e, Pinia, router, i18n, toast, Google login, FA icons, $unixToDate/$dayjs/$toast globaux
  App.vue            <header-block> + <router-view> avec transition slide-fade ; refresh token au montage
  router/index.ts    routes FR (/solo/:id?, /groupe/:id?, /competitif/:id?, /profil, /classement, /connexion, /inscription)
  views/             pages minces : conteneur `mx-auto max-w-5xl px-6 py-10` + 1 composant (sauf HomePage, autonome)
  components/
    HeaderBlock, LanguageSwitcher, ColorModeSwitcher   navigation (header sticky 75px, panneau mobile < lg)
    ModalDialog, OverlayBlock (loader), InputComponent, LoggedInBlock (CTA connexion/inscription)
    auth/        AuthLayout (gabarit), AuthLogin, AuthRegister, AuthCode (2FA e-mail), AuthForgotPassword, FieldRules
    game/        briques d'affichage partagées par les 3 modes (aucune logique de jeu, tout passe par props/événements) :
                 GameSetup (thèmes, difficulté, nb de questions ; v-model) · PartySummary · GameHud (question n/total, score, timer, quitter)
                 QuestionCard (états idle/pending/correct/wrong/dim) · AnswerFeedback · PlayerStatusList · LiveRanking
                 CountdownOverlay · GameResults (mascotte + verdict + stats, slots highlight/actions) · ResultsPodium · QuestionRecap · PlayerAvatar
    mascot/      MonkizzMascot (SVG provisoire) · MascotSpeech (bulle + mascotte)
    solo/        SoloSelect (GameSetup) → SoloQuiz (jeu + résultats)
    group/       GroupMode (étapes mode|lobby|game ; la saisie du code est dans l'étape mode) → GroupJoin, GroupLobby (+QRPreview, slot = GroupCreate), GroupQuiz
    online/      OnlineMode (étapes idle|search|found|game) → RankedMatchmaking (radar), RankedQuiz
    leaderboard/ Leaderboard (podium top 3 + liste + joueur courant épinglé)
    profile/     ProfileView → ProfilBlock (avatar, pseudo, mdp, suppression) + MatchHistoryBlock (liste paginée, filtres)
  stores/      user, solo, groupe, ranked (setup store), history, theme (liste des thèmes de quiz, ≠ thème visuel)
  composables/ useGroupLifecycle, useRankedLifecycle (connexion/déconnexion SignalR, cleanup, beforeunload), useColorMode (clair/sombre), useDifficulties (liste des 4 difficultés + conversion depuis l'API)
  services/    signalrService.ts (singleton, enums GroupEvent / RankedEvent), axiosOverlay(.js) + axiosOverlayConnector.js (token, refresh sur 401)
  locales/     fr.json / en.json (clés : common, nav, home, auth, profile, solo, group, competitive, leaderboard, modal, errors)
  mocks/       MSW (handlers + données) pour Cypress
```

Les gros fichiers : `GroupQuiz.vue` (~1640 l), `RankedQuiz.vue` (~1100 l), `SoloQuiz.vue` (~720 l), `MatchHistoryBlock.vue` (~620 l). Les écrans de jeu contiennent : timer, carte question, statut des joueurs, classement intermédiaire, overlay de compte à rebours, écran de fin (podium / ELO / récap des questions), modale de sortie.

## Conventions du code

- Stores : `loading` en compteur (`loading++` / `finally loading--`) + getter `isLoading` ; les actions **retournent l'erreur** au lieu de la lever (`return errData ?? error`).
- Appels API : toujours via `axiosOverlayConnector({ url, method, data })` avec `import.meta.env.VITE_API_URL + 'chemin'`.
- Temps réel : `signalrService.on/off/send/invoke` ; enregistrer les handlers dans un tableau `{ name, handler }` et les retirer au démontage. Événements serveur préfixés `On…` (voir `ranked.md` pour le hub Ranked).
- Types de partie de l'API : **1 groupe, 2 classé, 3 solo** (`src/services/partyTypes.ts`, `partyModeKey()`), ne pas se fier aux libellés renvoyés par l'API.
- Auth : routes protégées listées dans `router/index.ts` (`protectedRoutes`) ; `user.comeFrom` mémorise la cible avant login. Mode invité possible en groupe (`invitedToken`).
- Tout texte visible passe par i18n (`$t` / `t`) ; mettre à jour **fr.json et en.json** ensemble.
- `data-testid` utilisés par Cypress (home-solo, home-group, home-profile, solo-start, group-create, profile-logged, profile-history, profile-not-logged…) : ne pas les supprimer en refondant les layouts.
- Prettier : pas de point-virgule, simples quotes, largeur 100.

## Design system (DA « Évolution »)

- **Tokens** dans `src/assets/base.css` : variables `--c-*` en canaux RGB (`246 246 251`), valeurs claires sur `:root`, sombres sur `.dark`. Ne jamais écrire de hex/rgba en dur dans un composant : en CSS scoped, `rgb(var(--c-primary) / 0.4)` ; en classes, les couleurs Tailwind ci-dessous.
- **Couleurs Tailwind** (`tailwind.config.js`, `darkMode: 'class'`) : les `brand-*` pointent vers les tokens du même nom, avec un rôle fixe :
  `brand-bg` fond de page · `brand-surface` cartes/champs · `brand-surface2` blocs imbriqués dans une carte, pistes de slider · `brand-line` bordures neutres · `brand-ink` texte · `brand-muted` texte secondaire · `brand-purple` marque et action principale · `brand-orange` action secondaire / mauvaise réponse (texte dessus : `text-brand-onOrange`) · `brand-green` bonne réponse · `brand-yellow` récompenses · `diff-easy|medium|hard|hardcore` difficultés.
- **Piège** : `bg-brand-surface/30` dans une carte = blanc sur blanc en clair ; utiliser `bg-brand-surface2/…`. `text-white` seulement sur fond `brand-purple`.
- **Classes composants** (`@layer components` de `base.css`) : `.btn` + `.btn-primary|secondary|ghost`, `.surface-card` (ex-`gaming-card`), `.menu-card`, `.pill`, `.badge-*`, `.category-button`, `.difficulty-button` + `.diff-*`, `.slider-purple`, animations countdown.
- **Tics à éviter** (skill frontend-design) : étiquette au-dessus des titres, libellés en majuscules espacées, infos jointes par « · », un mot coloré dans un titre.
- **Interdit** (ancienne DA « gaming néon », retirée) : lueurs (`shadow-neon`, `glow-text`, `drop-shadow` colorés), dégradés animés, particules, polices gaming. Ombres disponibles : `shadow-card`, `shadow-soft`.
- **Mode clair/sombre** : `useColorMode()` (suit le système par défaut, choix mémorisé dans `localStorage['color-mode']`), script inline dans `index.html` pour éviter le flash, bouton `ColorModeSwitcher` dans le header.
- Polices : Baloo 2 (titres, boutons) + Nunito (texte), chargées dans `index.html`.
- Vérifier chaque écran dans les deux modes. Si le serveur de dev a été lancé avant une modif de `tailwind.config.js`, le redémarrer (sinon erreur `class does not exist` sur `base.css`).

## API (../api)

.NET, solution `Tuuuur.sln`. Contrôleurs REST dans `src/Tuuuur.API/Controllers` (Auth, Me, Solo, Group, Ranked, History, Theme, Difficulty) ; hubs SignalR dans `src/Tuuuur.API/Hubs` (`GroupHub`/`IGroupClient`, `RankedHub`/`IRankedClient`).
