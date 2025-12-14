/// <reference types="cypress" />

describe('Parcours 2: Groupe - Créer une partie et arriver dans un lobby', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it.skip('devrait permettre de créer une partie groupe et arriver dans le lobby', () => {
    // Étape 1: Depuis la home, cliquer sur "Jouer en groupe"
    cy.getByTestId('home-group').should('be.visible').click()

    cy.getByTestId('group-create').should('be.visible').click()

    // Étape 3: Se connecter
    cy.login()

    // Étape 4: Devrait être redirigé vers /groupe
    cy.url().should('include', '/groupe')
    cy.contains('Mode Groupe', { timeout: 10000 }).should('be.visible')

    // Étape 5: Cliquer sur "Créer une partie"
    cy.getByTestId('group-create').should('be.visible').click()

    // Étape 6: Devrait voir le formulaire de création
    cy.contains('Créer une partie').should('be.visible')

    // Étape 7: Cliquer sur le bouton "Créer"
    cy.getByTestId('group-create-submit').should('be.visible').click()

    // Étape 8: Devrait arriver dans le lobby
    cy.getByTestId('group-lobby', { timeout: 10000 }).should('be.visible')
    cy.contains('Lobby').should('be.visible')

    // Vérifier la présence d'un code de partie
    cy.contains(/TUR-|Code/i).should('exist')
  })
})
