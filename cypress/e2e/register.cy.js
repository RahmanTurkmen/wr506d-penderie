// Parcours métier : inscription d'un nouveau compte. Après succès, l'app
// redirige vers l'écran de connexion (pas de connexion automatique).

describe('Inscription', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.contains('Créer un compte').click()
  })

  it('crée un compte et renvoie vers la connexion', () => {
    const email = `cypress.${Date.now()}@lumen.local`

    cy.get('[data-cy=register-nom]').type('Testeur Cypress')
    cy.get('[data-cy=register-email]').type(email)
    cy.get('[data-cy=register-password]').type('motdepasse123')
    cy.get('[data-cy=register-submit]').click()

    cy.get('[data-cy=login-email]', { timeout: 10000 }).should('be.visible')
  })

  it('refuse un email déjà utilisé', () => {
    // test@lumen.local existe dans les fixtures de test.
    cy.get('[data-cy=register-nom]').type('Doublon')
    cy.get('[data-cy=register-email]').type('test@lumen.local')
    cy.get('[data-cy=register-password]').type('motdepasse123')
    cy.get('[data-cy=register-submit]').click()

    cy.get('[data-cy=register-error]').should('be.visible')
  })
})
