/// <reference types="cypress" />

describe('Parcours 1: Solo - Créer et lancer une partie', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for MSW to initialize
    cy.wait(1000)
  })

  it('devrait permettre de créer et lancer une partie solo après connexion', () => {
    // Étape 1: Depuis la home, cliquer sur "Jouer en solo"
    cy.getByTestId('home-solo').should('be.visible').click()

    cy.wait(1000) // Attendre la redirection

    // Étape 2: Se connecter
    cy.login()

    // Étape 3: Devrait être redirigé vers /solo
    cy.url().should('include', '/solo')

    // Étape 4: Attendre que les catégories soient chargées
    cy.contains('Mode Solo', { timeout: 10000 }).should('be.visible')

    // Étape 5: Sélectionner une catégorie (cliquer sur le premier bouton de catégorie)
    cy.get('.category-button').first().click()

    // Étape 6: Cliquer sur "Commencer l'aventure"
    cy.getByTestId('solo-start').should('be.visible').and('not.be.disabled').click()

    // Étape 7: Confirmer dans la modal
    cy.getByTestId('solo-confirm-modal').should('be.visible')
    cy.contains('button', 'Confirmer').click()

    // Étape 8: Vérifier qu'on est sur la page du quiz (devrait afficher des questions)
    cy.url().should('include', '/solo')

    // Attendre que le quiz se charge
    cy.contains(/question|Quiz/, { timeout: 10000, matchCase: false }).should('exist')
  })
})
