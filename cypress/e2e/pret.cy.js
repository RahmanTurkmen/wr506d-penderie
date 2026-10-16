// Parcours métier (§7) : créer un prêt sur un objet disponible, le
// retrouver "en cours", puis le clôturer ("Rendu") et le retrouver
// "Terminé".

function login() {
  cy.clearLocalStorage()
  cy.visit('/')
  cy.get('[data-cy=login-email]').type('test@lumen.local')
  cy.get('[data-cy=login-password]').type('password123')
  cy.get('[data-cy=login-submit]').click()
  cy.get('h1').contains('Bonjour Camille', { timeout: 10000 }).should('be.visible')
}

describe('Cycle de vie d\'un prêt', () => {
  it('crée un prêt, le voit en cours, puis le clôture', () => {
    const emprunteur = `Ami Cypress ${Date.now()}`

    login()

    // "Voir tout" (section Prêts à suivre) n'apparaît que s'il y a déjà un
    // prêt en cours (cas des fixtures de dev) ; sinon on y accède via le
    // bouton flottant "Nouveau prêt" après avoir ouvert la section Prêts.
    cy.contains('Voir tout').click()
    cy.contains('h1', 'Prêts', { timeout: 10000 }).should('be.visible')

    cy.get('[aria-label="Nouveau prêt"]').click()
    cy.contains('h1', 'Nouveau prêt', { timeout: 10000 }).should('be.visible')

    // On prend le premier objet disponible, quel qu'il soit (plutôt qu'un
    // nom fixe) : cette liste dépend de l'état réel de la base de dev, pas
    // figé d'un run à l'autre.
    cy.get('[data-cy=pret-objet-picker] button').first().click()
    cy.get('[data-cy=pret-emprunteur]').type(emprunteur)
    cy.get('[data-cy=pret-preter]').click()

    // Retour sur la liste, le nouveau prêt doit apparaître "en cours".
    cy.contains('h1', 'Prêts', { timeout: 10000 }).should('be.visible')
    cy.contains(`Prêté à ${emprunteur}`).should('be.visible')

    // Clôture ("Rendu") : le prêt bascule dans l'onglet "Terminés". On
    // scope la recherche du bouton à la ligne du prêt qu'on vient de créer
    // (les fixtures de dev ont déjà d'autres prêts actifs, chacun avec son
    // propre bouton "Rendu") via la classe distinctive de la ligne (Row).
    cy.contains('button.rounded-2xl', `Prêté à ${emprunteur}`).within(() => {
      cy.contains('button', 'Rendu').click()
    })

    cy.contains('button', /Terminés/).click()
    cy.contains(`Prêté à ${emprunteur}`, { timeout: 10000 }).should('be.visible')
  })
})
