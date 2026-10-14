import { defineConfig } from 'cypress'

export default defineConfig({
  // Lumen est mobile-first (deux en-têtes distincts existent dans le DOM,
  // l'un affiché seulement en dessous du breakpoint md de Tailwind) : on
  // teste donc au gabarit mobile, l'usage principal de l'app.
  viewportWidth: 390,
  viewportHeight: 844,
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
  },
})
