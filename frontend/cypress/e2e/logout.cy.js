// Parcours métier : déconnexion depuis le menu de profil (accessible en
// mobile via l'en-tête "Bonjour Camille").

describe('Déconnexion', () => {
  it('déconnecte et renvoie à l\'écran de connexion', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('[data-cy=login-email]').type('test@lumen.local')
    cy.get('[data-cy=login-password]').type('password123')
    cy.get('[data-cy=login-submit]').click()
    cy.get('h1').contains('Bonjour Camille', { timeout: 10000 }).should('be.visible')

    // Les deux en-têtes (mobile + desktop) montent chacun leur propre
    // ProfilMenu quand on ouvre le menu : les deux boutons existent dans le
    // DOM, un seul est visible selon le viewport.
    cy.get('[data-cy=profil-menu-toggle]').filter(':visible').click()
    cy.get('[data-cy=profil-menu-logout]').filter(':visible').click()

    cy.get('[data-cy=login-email]', { timeout: 10000 }).should('be.visible')
  })
})
