// === GROUPE DE TEST : Ajout / Suppression d'une recette dans les favoris ===

describe("Recipe Favoriting Flow", () => {
  // Avant chaque test dans ce bloc
  beforeEach(() => {
    // --- ÉTAPE 1 : Simulation de l'API Spoonacular ---
    cy.mockSpoonacular()

    // --- ÉTAPE 2 : Connexion d'un utilisateur test ---
    cy.visit("/login")
    // Utilisation de cy.wait pour ralentir l'exécution et mieux visualiser
    cy.wait(500)

    // Utilisation d'alias pour les champs de formulaire pour plus de clarté
    cy.get('input[type="email"]').as("emailField")
    cy.get('input[type="password"]').as("passwordField")
    cy.get('button[type="submit"]').as("submitButton")

    // Remplir les champs avec {delay} pour simuler une saisie humaine
    cy.get("@emailField").type("dhouha.lamin@gmail.com", { delay: 100 })
    cy.get("@passwordField").type("1972004d", { delay: 100 })

    // Pause pour visualiser avant de cliquer (utile en mode interactif)
    cy.wait(500)

    // Cliquer sur le bouton de connexion
    cy.get("@submitButton").click()

    // Attendre que la redirection soit complète
    cy.wait(1000)
  })

  // === TEST : Ajouter puis retirer une recette des favoris ===
  it("allows a user to favorite and unfavorite a recipe", () => {
    // --- PHASE 1 : ACCÈS À LA PAGE DE DÉTAILS ---
    cy.log("**Accès à la page de détails de la recette**")
    cy.visit("/recipe/715415")
    cy.wait(1000) // Attendre le chargement complet

    // Vérifier que la page est bien chargée
    cy.get(".recipe-details-title").should("be.visible")

    // --- PHASE 2 : AJOUT AUX FAVORIS ---
    cy.log("**Test d'ajout aux favoris**")

    // Vérifier l'état initial du bouton
    cy.contains("button", "Ajouter aux favoris").as("favoriteButton").should("be.visible")

    // Prendre une capture d'écran avant l'action
    cy.screenshot("before-favorite")

    // Cliquer sur le bouton avec une pause pour visualiser
    cy.get("@favoriteButton").click()
    cy.wait(1000)

    // Vérifier que le bouton a changé d'état
    cy.contains("button", "Ajouté aux favoris").should("be.visible").and("have.class", "active")

    // Vérifier que l'alerte s'affiche
    cy.on("window:alert", (text) => {
      expect(text).to.equal("Recette ajoutée aux favoris !")
    })

    // Prendre une capture d'écran après l'action
    cy.screenshot("after-favorite")

    // --- PHASE 3 : VÉRIFICATION DANS LA PAGE DE FAVORIS ---
    cy.log("**Vérification dans la page des favoris**")
    cy.visit("/favorites")
    cy.wait(1000)

    // Vérifier que la recette apparaît dans les favoris
    cy.contains("Red Lentil Soup with Chicken and Turnips").should("be.visible")

    cy.screenshot("favorites-page")

    // --- PHASE 4 : RETRAIT DES FAVORIS ---
    cy.log("**Test de retrait des favoris**")

    // Retourner à la page de la recette
    cy.visit("/recipe/715415")
    cy.wait(1000)

    // Vérifier que le bouton est dans l'état "Ajouté aux favoris"
    cy.contains("button", "Ajouté aux favoris").as("unfavoriteButton").should("be.visible")

    // Cliquer pour retirer des favoris
    cy.get("@unfavoriteButton").click()
    cy.wait(1000)

    // Vérifier que le bouton revient à l'état initial
    cy.contains("button", "Ajouter aux favoris").should("be.visible").and("not.have.class", "active")

    // Vérifier l'alerte de confirmation
    cy.on("window:alert", (text) => {
      expect(text).to.equal("Recette retirée des favoris !")
    })

    cy.screenshot("after-unfavorite")

    // --- PHASE 5 : VÉRIFICATION FINALE DANS LA PAGE DE FAVORIS ---
    cy.log("**Vérification finale dans la page des favoris**")
    cy.visit("/favorites")
    cy.wait(1000)

    // Vérifier que la recette n'apparaît plus
    cy.contains("Red Lentil Soup with Chicken and Turnips").should("not.exist")

    cy.screenshot("favorites-page-after-removal")
  })

  // Test supplémentaire : Tentative d'ajout aux favoris sans être connecté
  it("prompts user to login when trying to favorite while logged out", () => {
    // Se déconnecter d'abord
    cy.log("**Déconnexion de l'utilisateur**")
    cy.visit("/profile") // Supposons qu'il y a un bouton de déconnexion ici
    cy.contains("button", "Déconnexion").click()
    cy.wait(1000)

    // Visiter la page de recette
    cy.visit("/recipe/715415")
    cy.wait(1000)

    // Essayer d'ajouter aux favoris
    cy.contains("button", "Ajouter aux favoris").click()

    // Vérifier l'alerte demandant de se connecter
    cy.on("window:alert", (text) => {
      expect(text).to.equal("Veuillez vous connecter pour ajouter des favoris")
    })

    cy.screenshot("login-prompt")
  })
})

// Commandes personnalisées pour améliorer la lisibilité des tests
Cypress.Commands.add("loginUser", (email, password) => {
  cy.visit("/login")
  cy.get('input[type="email"]').type(email, { delay: 100 })
  cy.get('input[type="password"]').type(password, { delay: 100 })
  cy.get('button[type="submit"]').click()
  cy.wait(1000)
})

Cypress.Commands.add("checkFavoriteStatus", (recipeId, expectedStatus) => {
  cy.visit(`/recipe/${recipeId}`)
  cy.wait(1000)
  if (expectedStatus === "favorited") {
    cy.contains("button", "Ajouté aux favoris").should("be.visible")
  } else {
    cy.contains("button", "Ajouter aux favoris").should("be.visible")
  }
})
