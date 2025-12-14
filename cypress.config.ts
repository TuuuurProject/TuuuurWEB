// cypress.config.js
const { defineConfig } = require('cypress')
const { vitePreprocessor } = require('cypress-vite')

module.exports = defineConfig({
  requestTimeout: 30000,
  responseTimeout: 30000,
  video: false,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: true,
  fixturesFolder: 'cypress/fixtures',
  e2e: {
    setupNodeEvents(on: any, config: any) {
      on('file:preprocessor', vitePreprocessor())

      // Code coverage
      require('@cypress/code-coverage/task')(on, config)
      return config
    },
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/index.ts',
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
  },
})
