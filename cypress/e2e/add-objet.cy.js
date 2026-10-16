// Parcours métier central (§3) : ajouter un objet manuellement (sans
// photo), avec son emplacement (logement + pièce existants).

function login() {
  cy.clearLocalStorage()
  cy.visit('/')
  cy.get('[data-cy=login-email]').type('test@lumen.local')
  cy.get('[data-cy=login-password]').type('password123')
  cy.get('[data-cy=login-submit]').click()
  cy.get('h1').contains('Bonjour Camille', { timeout: 10000 }).should('be.visible')
}

describe('Ajout manuel d\'un objet', () => {
  beforeEach(() => {
    login()
  })

  it('crée un objet rattaché à une pièce existante et l\'affiche dans l\'inventaire', () => {
    const nom = `Objet Cypress ${Date.now()}`

    cy.get('[data-cy=home-ajouter]').click()

    // Étape 1 (Photo) : on passe sans photo.
    cy.get('[data-cy=objet-skip-photo]').click()

    // Étape 2 (Infos) : nom + catégorie existante ("Outils", chargée par les fixtures).
    cy.get('[data-cy=objet-nom]').type(nom)
    cy.contains('button', 'Outils').click()
    cy.get('[data-cy=objet-continuer]').click()

    // Étape 3 (Emplacement) : logement + pièce existants ("Maison principale" > "Salon").
    cy.contains('button', 'Maison principale').click()
    cy.contains('button', 'Salon').click()
    cy.get('[data-cy=objet-ajouter]').click()

    // Après création, l'app ouvre directement la fiche du nouvel objet.
    cy.contains('h1', nom, { timeout: 10000 }).should('be.visible')
  })
})
