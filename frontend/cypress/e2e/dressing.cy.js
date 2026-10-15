// Parcours métier : le Dressing est une vue filtrée de l'inventaire (objets
// de type "vetement"), avec un filtrage par catégorie et par tag. Utilise
// les vraies fixtures de dev (AppFixtures) : "Veste en jean" (catégorie
// Vestes, sans tag), "Puffer"/"Jean droit"/"Sneakers blanches" (tag
// Décontracté).

function login() {
  cy.clearLocalStorage()
  cy.visit('/')
  cy.get('[data-cy=login-email]').type('test@lumen.local')
  cy.get('[data-cy=login-password]').type('password123')
  cy.get('[data-cy=login-submit]').click()
  cy.get('h1').contains('Bonjour Camille', { timeout: 10000 }).should('be.visible')
}

describe('Dressing (filtrage)', () => {
  beforeEach(() => {
    login()
    cy.get('[data-cy=nav-inventaire]').click()
    cy.contains('Mon dressing').click()
    cy.contains('h1', 'Dressing', { timeout: 10000 }).should('be.visible')
  })

  it('affiche tous les vêtements sans filtre', () => {
    cy.contains('Veste en jean').should('be.visible')
    cy.contains('Puffer').should('be.visible')
  })

  it('filtre par catégorie "Vestes" : ne garde que la Veste en jean', () => {
    cy.contains('button', 'Vestes').click()

    cy.contains('Veste en jean').should('be.visible')
    cy.contains('Puffer').should('not.exist')
  })

  it('filtre par le tag #Décontracté : exclut la Veste en jean (sans tag)', () => {
    cy.contains('#Décontracté').click()

    cy.contains('Puffer').should('be.visible')
    cy.contains('Veste en jean').should('not.exist')
  })

  it('revenir à "Tout" réaffiche tous les vêtements', () => {
    cy.contains('button', 'Vestes').click()
    cy.contains('Puffer').should('not.exist')

    cy.contains('button', 'Tout').click()
    cy.contains('Puffer').should('be.visible')
  })
})
