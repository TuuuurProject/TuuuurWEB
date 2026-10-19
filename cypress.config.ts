import { defineConfig } from 'cypress'
import { vitePreprocessor } from 'cypress-vite'
import codeCoverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  requestTimeout: 30000,
  responseTimeout: 30000,
  video: false,
  screenshotOnRunFailure: true,
  fixturesFolder: 'cypress/fixtures',
  e2e: {
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor())

      // Code coverage
      codeCoverageTask(on, config)
      return config
    },
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/index.ts',
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
  },
})
