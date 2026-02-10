# Tests E2E Cypress avec MSW

Ce projet contient une suite complète de tests End-to-End (E2E) Cypress avec Mock Service Worker (MSW) pour tester l'application Vue 3 de manière totalement autonome, sans backend réel.

## 📁 Structure des fichiers créés/modifiés

### Configuration MSW

- **`src/mocks/handlers.ts`** : Handlers MSW pour tous les endpoints API (auth, user, solo, history, themes, group)
- **`src/mocks/browser.ts`** : Configuration du Service Worker MSW pour le navigateur
- **`src/mocks/data/user.ts`** : Données mock et utilitaires pour les utilisateurs (credentials, tokens JWT, userInfo)
- **`src/mocks/data/games.ts`** : Données mock pour les parties solo/groupe (questions, réponses, lobby)
- **`src/mocks/data/history.ts`** : Données mock pour l'historique des parties
- **`public/mockServiceWorker.js`** : Service Worker généré par MSW (auto-généré)
- **`.env.e2e`** : Variables d'environnement pour le mode E2E

### Configuration Cypress

- **`cypress.config.ts`** : Configuration Cypress mise à jour (baseUrl, specPattern, etc.)
- **`cypress/support/commands.ts`** : Commands custom Cypress (`getByTestId`, `login`)
- **`cypress/e2e/01-solo-create-launch.cy.ts`** : Test parcours 1 (Solo)
- **`cypress/e2e/02-group-create-lobby.cy.ts`** : Test parcours 2 (Groupe)
- **`cypress/e2e/03-profile-view.cy.ts`** : Test parcours 3 (Profil + Historique)
- **`cypress/e2e/04-profile-logout.cy.ts`** : Test parcours 4 (Déconnexion)
- **`cypress/e2e/00-debug.cy.ts`** : Test de debug pour vérifier le chargement

### Modifications de l'application

- **`src/main.ts`** : Initialisation de MSW en mode E2E
- **`src/views/HomePage.vue`** : Ajout de `data-testid` (home-solo, home-group, home-profile)
- **`src/components/auth/AuthLogin.vue`** : Ajout de `data-testid` (login-username, login-password, login-submit)
- **`src/components/solo/SoloSelect.vue`** : Ajout de `data-testid` (solo-start, solo-confirm-modal)
- **`src/components/group/GroupMode.vue`** : Ajout de `data-testid` (group-create)
- **`src/components/group/GroupCreate.vue`** : Ajout de `data-testid` (group-create-submit)
- **`src/components/group/GroupLobby.vue`** : Ajout de `data-testid` (group-lobby)
- **`src/components/profile/ProfileView.vue`** : Ajout de `data-testid` (profile-logged, profile-not-logged, profile-history)
- **`src/components/profile/ProfilBlock.vue`** : Ajout de `data-testid` (profile-info, profile-logout)
- **`package.json`** : Ajout des scripts `dev:e2e`, `e2e:open`, `e2e:run`

## 🚀 Utilisation

### Installation

Les dépendances sont déjà installées. Si besoin, réinstaller avec :

```bash
npm install
```

### Lancer les tests E2E (mode interactif)

```bash
npm run e2e:open
```

Cette commande :

1. Démarre le serveur Vite en mode E2E (avec MSW activé)
2. Ouvre Cypress en mode interactif
3. Vous pouvez sélectionner et exécuter les tests manuellement

### Lancer les tests E2E (mode headless)

```bash
npm run e2e:run
```

Cette commande :

1. Démarre le serveur Vite en mode E2E
2. Exécute tous les tests Cypress en mode headless
3. Affiche les résultats dans le terminal

## 🎯 Parcours utilisateur testés

### Parcours 1: Solo - Créer et lancer une partie

1. Home → clic "Jouer en solo"
2. Redirection vers page connexion
3. Se connecte avec les credentials mock (testuser / password123)
4. Redirection vers /solo
5. Sélection d'une catégorie
6. Clic "Commencer l'aventure"
7. Confirmation dans la modal
8. Vérification que le quiz est lancé

### Parcours 2: Groupe - Créer une partie et arriver dans un lobby

1. Home → clic "Jouer en groupe"
2. Redirection vers page connexion
3. Se connecte
4. Redirection vers /groupe
5. Clic "Créer une partie"
6. Clic "Créer" dans le formulaire
7. Vérification de l'arrivée dans le lobby avec code de partie

### Parcours 3: Profil - Voir infos profil et historique

1. Home → clic "Profil"
2. Redirection vers page connexion
3. Se connecte
4. Redirection vers /profil
5. Vérification de l'affichage des infos profil (TestUser, test@example.com)
6. Vérification de l'affichage de l'historique des parties

### Parcours 4: Profil - Se déconnecter

1. Home → clic "Profil"
2. Redirection vers page connexion
3. Se connecte
4. Vérification état connecté
5. Clic "Se déconnecter"
6. Vérification état non connecté
7. Vérification que l'historique n'est plus affiché
8. Vérification du message de demande de connexion

## 🔧 Configuration

### Mode E2E

Le mode E2E est activé quand Vite démarre avec `--mode e2e`. Cela :

- Charge les variables depuis `.env.e2e`
- Active MSW dans `main.ts`
- Mocke tous les appels API

### Credentials mock

Les credentials de test sont définis dans `src/mocks/data/user.ts` :

- **Username**: `testuser`
- **Password**: `password123`
- **Email**: `test@example.com`

### Endpoints mockés

Tous les endpoints suivants sont mockés :

- `POST /auth/login`
- `POST /auth/2fa/verify`
- `POST /auth/register`
- `POST /auth/google`
- `GET /me`
- `PUT /me/avatar`
- `PUT /me/change-password`
- `DELETE /me`
- `POST /solo`
- `GET /solo/:id`
- `POST /solo/:id`
- `GET /history`
- `POST /group`
- `GET /Theme`

## 📝 Notes et ajustements

### Problèmes résolus

1. **MSW ne démarrait pas** : Ajout de logs et gestion d'erreur dans `main.ts`
2. **Variables d'environnement** : Utilisation de `--mode e2e` au lieu de variables env shell
3. **Service Worker** : Génération avec `npx msw init public/`
4. **Stratégie onUnhandledRequest** : Changé de 'error' à 'warn' pour éviter les blocages

### Améliorations possibles

1. **Vérification 2FA** : Actuellement, le code 2FA est accepté automatiquement. Pour plus de réalisme, ajuster le handler.
2. **Données dynamiques** : Les questions et l'historique sont statiques. Ajouter plus de variété si nécessaire.
3. **Screenshots** : Activer les screenshots Cypress pour debug (`screenshotOnRunFailure: true`)
4. **Vidéos** : Activer les vidéos Cypress si besoin de reproduire les échecs
5. **Strictness MSW** : Remettre `onUnhandledRequest: 'error'` une fois tous les endpoints identifiés

### Debugging

Si les tests échouent :

1. Vérifier les logs MSW dans la console du navigateur
2. Ouvrir Cypress en mode interactif (`npm run e2e:open`) pour voir l'exécution
3. Vérifier que le serveur démarre correctement en mode E2E
4. Vérifier les logs Vite dans le terminal
5. Utiliser le test de debug `00-debug.cy.ts` pour inspecter la page

## 🎓 Conventions

### data-testid

Convention utilisée : `{composant}-{action}` ou `{section}-{élément}`

- Exemples : `home-solo`, `login-username`, `profile-logout`, `group-lobby`

### Commands Cypress custom

- `cy.getByTestId(id)` : Sélectionne un élément par son data-testid
- `cy.login(username, password)` : Se connecte automatiquement

## 📊 Résultats attendus

Tous les tests devraient passer avec :

- ✅ 4 tests passants
- ⏱️ ~40-60 secondes d'exécution totale
- 📊 100% de couverture des parcours définis

## 🔗 Ressources

- [MSW Documentation](https://mswjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
