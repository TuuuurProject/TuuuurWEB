describe('Gaming interface', () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    it(`keeps the hub usable without horizontal overflow at ${width}px`, () => {
      cy.viewport(width, 900)
      cy.visit('/')
      cy.title().should('contain', 'Monkizz')
      cy.get('h1').should('contain', 'Un esprit curieux.')
      cy.get('.brand-lockup').should('have.attr', 'aria-label', 'Monkizz')
      cy.get('.mascot-stage .monkey-mascot').should('be.visible')
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
    cy.get('h1').should('contain', 'A curious mind.')
    cy.reload()
    cy.get('h1').should('contain', 'A curious mind.')
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

  it('links to the instructions and recovers unknown routes', () => {
    cy.viewport(1440, 900)
    cy.visit('/page-inconnue')
    cy.location('pathname').should('eq', '/')
    cy.get('.desktop-nav a[href="/#how-to-play"]').click()
    cy.location('hash').should('eq', '#how-to-play')
    cy.get('#how-to-play ol li').should('have.length', 3)
  })
})
