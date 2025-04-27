// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

export {}

// Déclaration pour TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      mockSpoonacular(): Chainable<void>
      loginUser(email: string, password: string): Chainable<void>
      checkFavoriteStatus(recipeId: string, expectedStatus: "favorited" | "unfavorited"): Chainable<void>
      mockParseAuth(isLoggedIn: boolean): Chainable<void>
    }
  }
}

// -- This is a parent command --
Cypress.Commands.add("mockSpoonacular", () => {
  // Ne pas intercepter les requêtes vers l'API Spoonacular
  // Laisser passer les vraies requêtes vers l'API avec la clé stockée dans Back4App

  // Intercepter uniquement les requêtes Parse pour les favoris
  cy.intercept("POST", "**/parse/classes/Favorite", (req) => {
    req.reply({ success: true, objectId: "abc123" })
  }).as("addFavorite")

  cy.intercept("DELETE", "**/parse/classes/Favorite/**", {
    statusCode: 200,
    body: { success: true },
  }).as("removeFavorite")
})

// Commande pour simuler l'état d'authentification Parse
Cypress.Commands.add("mockParseAuth", (isLoggedIn) => {
  if (isLoggedIn) {
    // Simuler un utilisateur connecté
    cy.intercept("GET", "**/parse/users/me", {
      statusCode: 200,
      body: {
        objectId: "user123",
        username: "dhouha.lamin@gmail.com",
        email: "dhouha.lamin@gmail.com",
        createdAt: "2023-01-01T00:00:00.000Z",
      },
    }).as("parseCurrentUser")

    // Simuler la vérification d'authentification
    cy.intercept("POST", "**/parse/functions/isAuthenticated", {
      statusCode: 200,
      body: { result: true },
    }).as("parseIsAuthenticated")
  } else {
    // Simuler un utilisateur non connecté
    cy.intercept("GET", "**/parse/users/me", {
      statusCode: 401,
      body: { error: "Invalid session token" },
    }).as("parseCurrentUser")

    // Simuler la vérification d'authentification
    cy.intercept("POST", "**/parse/functions/isAuthenticated", {
      statusCode: 200,
      body: { result: false },
    }).as("parseIsAuthenticated")
  }
})

// Commande pour se connecter facilement
Cypress.Commands.add("loginUser", (email, password) => {
  cy.visit("/login")
  cy.get('input[type="email"]').type(email, { delay: 100 })
  cy.get('input[type="password"]').type(password, { delay: 100 })
  cy.get('button[type="submit"]').click()
  cy.wait(1000)

  // Simuler l'authentification Parse après la connexion
  cy.mockParseAuth(true)
})

// Commande pour vérifier le statut des favoris
Cypress.Commands.add("checkFavoriteStatus", (recipeId, expectedStatus) => {
  cy.visit(`/recipes/details/${recipeId}`) // Ajustez ce chemin selon votre application
  cy.wait(1000)
  if (expectedStatus === "favorited") {
    cy.contains("button", "Ajouté aux favoris").should("be.visible")
  } else {
    cy.contains("button", "Ajouter aux favoris").should("be.visible")
  }
})

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
