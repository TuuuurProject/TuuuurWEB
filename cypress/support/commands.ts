/// <reference types="cypress" />

// Custom command to get element by data-testid
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

Cypress.Commands.add('getById', (id: string) => {
  return cy.get(`#${id}`)
})

// Custom command to login
Cypress.Commands.add('login', (username = 'testuser', password = 'password123') => {
  // Clear storage first
  cy.clearLocalStorage()
  cy.clearCookies()

  // Clik on btn to go to login
  cy.getById('btnSeConnecter').should('be.visible').click()

  // Wait for the login effect
  cy.wait(300)

  // Fill login form
  cy.getByTestId('login-username').clear().type(username)
  cy.getByTestId('login-password').clear().type(password)

  cy.getByTestId('login-submit').click()

  // Wait a bit for the request to be processed
  cy.wait(500)

  // Handle 2FA verification code
  cy.getByTestId('auth-code-container').should('be.visible')

  // Fill in the verification code (any 6-digit code works in E2E mode)
  for (let i = 1; i <= 6; i++) {
    cy.getByTestId(`auth-code-input-${i}`).should('be.visible').type(i.toString())
  }

  cy.getByTestId('auth-code-submit').should('be.visible').click()

  // Wait for the modal to disappear
  cy.getByTestId('auth-code-container').should('not.exist')

  // Wait for token in localStorage (indicating successful login)
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'user-store')
    .should('exist')
    .then((stored) => {
      const data = JSON.parse(stored as string)
      expect(data.token).to.exist
    })
})

// Extend Cypress namespace for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select element by data-testid attribute
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>

      /**
       * Custom command to select element by id attribute
       * @example cy.getById('submit-button')
       */
      getById(id: string): Chainable<JQuery<HTMLElement>>

      /**
       * Custom command to login a user
       * @example cy.login('testuser', 'password123')
       */
      login(username?: string, password?: string): Chainable<void>
    }
  }
}

export {}
