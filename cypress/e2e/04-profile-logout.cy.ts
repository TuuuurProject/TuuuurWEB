/// <reference types="cypress" />

describe('Parcours 4: Profil - Se déconnecter et voir état non connecté', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for MSW to initialize
    cy.wait(1000)
  })

  it.skip("devrait permettre de se déconnecter et revenir à l'état non connecté", () => {
    // Étape 1: Depuis la home, cliquer sur "Profil"
    cy.getByTestId('home-profile').should('be.visible').click()

    // Étape 3: Se connecter
    cy.login()

    // Étape 4: Devrait être redirigé vers /profil
    cy.url().should('include', '/profil')

    // Étape 5: Vérifier qu'on voit le profil connecté
    cy.getByTestId('profile-logged', { timeout: 10000 }).should('be.visible')

    // Étape 6: Cliquer sur "Se déconnecter"
    cy.getByTestId('profile-logout').should('be.visible').click()

    // Étape 7: Vérifier qu'on voit l'état non connecté
    cy.getByTestId('profile-not-logged', { timeout: 5000 }).should('be.visible')

    // Étape 8: Vérifier qu'on ne voit plus les infos du profil
    cy.getByTestId('profile-logged').should('not.exist')

    // Étape 9: Vérifier qu'on ne voit plus l'historique
    cy.getByTestId('profile-history').should('not.exist')

    // Étape 10: Vérifier le message de demande de connexion
    cy.contains(/connectez|créez/i).should('be.visible')

    // Étape 11: Vérifier que le localStorage ne contient plus de token
    // cy.window()
    //   .its('localStorage')
    //   .invoke('getItem', 'user-store')
    //   .then((stored) => {
    //     if (stored) {
    //       const data = JSON.parse(stored)
    //       expect(data.token).to.be.null
    //     }
    //   })
  })
})
