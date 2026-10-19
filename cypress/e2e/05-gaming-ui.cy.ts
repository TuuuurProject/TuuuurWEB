describe('Gaming interface', () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    it(`keeps the hub usable without horizontal overflow at ${width}px`, () => {
      cy.viewport(width, 900)
      cy.visit('/')
      cy.title().should('contain', 'Monkizz')
      cy.get('h1').should('contain', 'Ta culture.')
      cy.get('.brand-lockup').should('have.attr', 'aria-label', 'Monkizz')
      cy.get('.character-viewport').should('be.visible')
      cy.get('.monkey-3d').should('not.have.attr', 'data-state', 'loading')
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
    cy.get('h1').should('contain', 'Your knowledge.')
    cy.reload()
    cy.get('h1').should('contain', 'Your knowledge.')
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

  it('renders the real 3D character and exposes keyboard-operable controls', () => {
    cy.viewport(1440, 900)
    cy.visit('/')
    cy.get('.monkey-3d').should('have.attr', 'data-state', 'ready')
    cy.get('.monkey-3d-canvas')
      .should('be.visible')
      .then(($canvas) => {
        const canvas = $canvas[0] as HTMLCanvasElement
        expect(canvas.width).to.be.greaterThan(0)
        expect(canvas.getContext('webgl2')).not.to.be.null
      })
    cy.get('button[aria-label="Tourner Moki vers la gauche"]').click()
    cy.get('button[aria-label="Tourner Moki vers la droite"]').click()
    cy.get('.character-react').focus().should('have.focus').click()
    cy.get('.character-speech').should('contain', "Je n'ai plus de réseau")
  })

  it('keeps every game mode reachable when WebGL is unavailable', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win, 'WebGL2RenderingContext', {
          value: undefined,
          configurable: true,
        })
      },
    })
    cy.get('.monkey-3d').should('have.attr', 'data-state', 'unavailable')
    cy.get('.monkey-3d-fallback').should('be.visible')
    cy.get('.character-controls').should('contain', '3D indisponible')
    cy.get('.character-controls button').should('not.exist')
    cy.getByTestId('home-solo').click()
    cy.location('pathname').should('eq', '/solo')
  })
})
