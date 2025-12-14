// cypress.config.js
const { defineConfig } = require('cypress')
const { vitePreprocessor } = require('cypress-vite')

module.exports = defineConfig({
  requestTimeout: 30000,
  video: false,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: false,
  fixturesFolder: 'cypress/fixtures',
  e2e: {
    setupNodeEvents(on, _config) {
      on('file:preprocessor', vitePreprocessor())
    },
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/index.ts',
  },
})
