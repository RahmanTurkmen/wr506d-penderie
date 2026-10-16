// Campagne e2e Cypress (séance 16-21) — exécutée en local contre la pile
// docker-compose réelle (nginx:8080 + base de dev "lumen", fixtures
// AppFixtures déjà chargées : test@lumen.local / password123).
//
// On couvre le parcours utilisateur le plus critique de l'app : sans
// connexion, rien d'autre n'est accessible.

describe("Connexion", () => {
  beforeEach(() => {
    // Toujours repartir d'un état déconnecté, même si un token traîne
    // encore dans le localStorage du navigateur Cypress.
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('refuse un mauvais mot de passe avec un message explicite', () => {
    cy.get('[data-cy=login-email]').type('test@lumen.local')
    cy.get('[data-cy=login-password]').type('mauvais-mot-de-passe')
    cy.get('[data-cy=login-submit]').click()

    cy.get('[data-cy=login-error]').should('be.visible')
    // On doit rester sur l'écran de connexion, pas de redirection silencieuse.
    cy.get('[data-cy=login-email]').should('be.visible')
  })

  it('connecte avec les identifiants de démo et affiche l\'accueil', () => {
    cy.get('[data-cy=login-email]').type('test@lumen.local')
    cy.get('[data-cy=login-password]').type('password123')
    cy.get('[data-cy=login-submit]').click()

    cy.get('h1').contains('Bonjour Camille', { timeout: 10000 }).should('be.visible')
    cy.get('[data-cy=nav-accueil]').should('be.visible')
    cy.get('[data-cy=nav-inventaire]').should('be.visible')
  })
})
