/// <reference types="cypress" />

describe('Parcours 3: Profil - Voir infos profil et historique', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for MSW to initialize
    cy.wait(1000)
  })

  it("devrait afficher les informations du profil et l'historique après connexion", () => {
    // Étape 1: Depuis la home, cliquer sur "Profil"
    cy.getByTestId('home-profile').should('be.visible').click()

    cy.wait(1000) // Attendre la redirection

    // Étape 3: Se connecter
    cy.login()

    // Étape 4: Devrait être redirigé vers /profil
    cy.url().should('include', '/profil')

    // Étape 5: Vérifier qu'on voit le profil connecté
    cy.getByTestId('profile-logged', { timeout: 10000 }).should('be.visible')

    // Étape 6: Vérifier que les infos du profil sont affichées
    cy.getByTestId('profile-info').should('be.visible')
    cy.contains('TestUser').should('be.visible')
    cy.contains('test@example.com').should('be.visible')

    // Étape 7: Vérifier que l'historique est affiché
    cy.getByTestId('profile-history').should('be.visible')

    // Étape 8: Vérifier qu'il y a des parties dans l'historique
    cy.getByTestId('profile-history').within(() => {
      cy.contains(/historique|match/i, { timeout: 10000 }).should('exist')
    })
  })
})
