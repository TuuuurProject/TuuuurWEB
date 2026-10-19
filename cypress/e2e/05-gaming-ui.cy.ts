describe('Gaming interface', () => {
  for (const width of [320, 390, 768, 1440]) {
    it(`keeps the hub usable without horizontal overflow at ${width}px`, () => {
      cy.viewport(width, 900)
      cy.visit('/')
      cy.get('h1').should('contain', 'Ta curiosité.')
      cy.getByTestId('home-solo').should('be.visible').and('have.attr', 'href', '/solo')
      cy.getByTestId('home-group').should('be.visible').and('have.attr', 'href', '/groupe')
      cy.getByTestId('home-ranked').should('be.visible').and('have.attr', 'href', '/competitif')
      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth).to.be.at.most(width)
      })
    })
  }

  it('navigates on mobile and keeps the language preference after reload', () => {
    cy.viewport(390, 844)
    cy.visit('/')
    cy.get('.language-select').select('en')
    cy.get('h1').should('contain', 'Your curiosity.')
    cy.reload()
    cy.get('h1').should('contain', 'Your curiosity.')
    cy.get('.mobile-menu-toggle').click().should('have.attr', 'aria-expanded', 'true')
    cy.get('#mobile-navigation a[href="/groupe"]').click()
    cy.location('pathname').should('eq', '/groupe')
    cy.get('#mobile-navigation').should('not.exist')
  })

  it('provides an in-page shortcut to real playable modes', () => {
    cy.visit('/')
    cy.get('.hero-secondary').click()
    cy.location('hash').should('eq', '#game-modes')
    cy.getByTestId('home-solo').click()
    cy.location('pathname').should('eq', '/solo')
    cy.get('#btnSeConnecter').should('be.visible')
  })
})
