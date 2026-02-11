/// <reference types="cypress" />

describe('Parcours 2: Groupe - Créer une partie et arriver dans un lobby', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for MSW to initialize
    cy.wait(1000)
  })

  it('devrait permettre de créer une partie groupe et arriver dans le lobby', () => {
    // Étape 1: Depuis la home, cliquer sur "Jouer en groupe"
    cy.getByTestId('home-group').should('be.visible').click()

    cy.wait(1000) // Attendre la redirection

    // Étape 3: Se connecter
    cy.login()

    cy.getByTestId('group-create').should('be.visible').click()

    // Étape 4: Devrait être redirigé vers /groupe
    cy.url().should('include', '/groupe')
    cy.contains('Lobby', { timeout: 10000 }).should('be.visible')
  })
})
