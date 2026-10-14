// Parcours : une fois connecté, la navigation principale (barre du bas)
// doit amener sur chaque section prête (Accueil, Inventaire, Logements).

function login() {
  cy.clearLocalStorage()
  cy.visit('/')
  cy.get('[data-cy=login-email]').type('test@lumen.local')
  cy.get('[data-cy=login-password]').type('password123')
  cy.get('[data-cy=login-submit]').click()
  cy.get('h1').contains('Bonjour Camille', { timeout: 10000 }).should('be.visible')
}

describe('Navigation principale', () => {
  beforeEach(() => {
    login()
  })

  it("mène à l'inventaire et affiche la liste d'objets", () => {
    cy.get('[data-cy=nav-inventaire]').click()

    cy.contains('h1', 'Inventaire').should('be.visible')
    // Les fixtures contiennent au moins l'objet "Perceuse Makita".
    cy.contains('Perceuse Makita', { timeout: 10000 }).should('be.visible')
  })

  it('mène aux logements', () => {
    cy.get('[data-cy=nav-logements]').click()

    cy.contains('Maison principale', { timeout: 10000 }).should('be.visible')
  })

  it('revient à l\'accueil', () => {
    cy.get('[data-cy=nav-inventaire]').click()
    cy.get('[data-cy=nav-accueil]').click()

    cy.get('h1').contains('Bonjour Camille').should('be.visible')
  })
})
