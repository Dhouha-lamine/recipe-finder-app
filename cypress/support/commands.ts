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

// Prevent uncaught exceptions from failing tests
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

// -- This is a parent command --
Cypress.Commands.add("mockSpoonacular", () => {
  // Mock Spoonacular search API
  cy.intercept("GET", "**/recipes/complexSearch**", {
    statusCode: 200,
    body: {
      results: [
        {
          id: "testRecipe123", // Use a custom ID for testing
          title: "Test Recipe 123",
          image: "https://example.com/image.jpg",
        },
      ],
      offset: 0,
      number: 10,
      totalResults: 1,
    },
  }).as("searchSpoonacularRecipes");

  // Mock Spoonacular recipe details API
  cy.intercept("GET", "**/recipes/testRecipe123/information**", {
    statusCode: 200,
    body: {
      id: "testRecipe123",
      title: "Test Recipe 123",
      image: "https://example.com/image.jpg",
      readyInMinutes: 30,
      servings: 4,
      extendedIngredients: [
        { original: "ing1" },
        { original: "ing2" },
      ],
      analyzedInstructions: [
        {
          steps: [
            { step: "step1" },
            { step: "step2" },
          ],
        },
      ],
    },
  }).as("getSpoonacularRecipe");

  // Mock Parse save operation (when the recipe is saved to Parse)
  cy.intercept("POST", "**/parse/classes/Recipe", {
    statusCode: 201,
    body: {
      objectId: "parseRecipe123", // Assign a known Parse ID
      createdAt: "2023-01-01T00:00:00.000Z",
    },
  }).as("saveRecipe");

  // Mock Parse fetch operation (when the recipe is retrieved)
  cy.intercept("POST", "**/functions/getRecipeById", {
    statusCode: 200,
    body: {
      result: {
        objectId: "parseRecipe123",
        title: "Test Recipe 123",
        description: "A test recipe",
        time: "30 minutes",
        servings: 4,
        image: "https://example.com/image.jpg",
        ingredients: ["ing1", "ing2"],
        steps: ["step1", "step2"],
        tags: ["test"],
      },
    },
  }).as("getParseRecipe");

  // Mock Parse favorite operations
  cy.intercept("POST", "**/parse/classes/Favorite", (req) => {
    req.reply({ success: true, objectId: "abc123" });
  }).as("addFavorite");

  cy.intercept("DELETE", "**/parse/classes/Favorite/**", {
    statusCode: 200,
    body: { success: true },
  }).as("removeFavorite");
});

// Commande pour simuler l'état d'authentification Parse
Cypress.Commands.add("mockParseAuth", (isLoggedIn) => {
  if (isLoggedIn) {
    cy.intercept("GET", "**/parse/users/me", {
      statusCode: 200,
      body: {
        objectId: "user123",
        username: "dhouha.lamin@gmail.com",
        email: "dhouha.lamin@gmail.com",
        createdAt: "2023-01-01T00:00:00.000Z",
      },
    }).as("parseCurrentUser");

    cy.intercept("POST", "**/parse/functions/isAuthenticated", {
      statusCode: 200,
      body: { result: true },
    }).as("parseIsAuthenticated");
  } else {
    cy.intercept("GET", "**/parse/users/me", {
      statusCode: 401,
      body: { error: "Invalid session token" },
    }).as("parseCurrentUser");

    cy.intercept("POST", "**/parse/functions/isAuthenticated", {
      statusCode: 200,
      body: { result: false },
    }).as("parseIsAuthenticated");

    cy.intercept("POST", "**/parse/classes/Favorite", {
      statusCode: 401,
      body: { error: "User must be logged in" },
    }).as("addFavoriteNotLoggedIn");
  }
});

// Commande pour se connecter facilement
Cypress.Commands.add("loginUser", (email, password) => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit("/login");
  cy.get('input[type="email"]', { timeout: 10000 }).should("be.visible").type(email, { delay: 100 });
  cy.get('input[type="password"]').type(password, { delay: 100 });
  cy.get('button[type="submit"]').click();
  cy.intercept("POST", "**/parse/login", { statusCode: 200 }).as("parseLogin");
  cy.wait("@parseLogin");
  cy.mockParseAuth(true);
});

// Commande pour vérifier le statut des favoris
Cypress.Commands.add("checkFavoriteStatus", (recipeId, expectedStatus) => {
  cy.visit(`/recipes/details/${recipeId}`);
  cy.wait(1000);
  if (expectedStatus === "favorited") {
    cy.contains("button", "Ajouté aux favoris").should("be.visible");
  } else {
    cy.contains("button", "Ajouter aux favoris").should("be.visible");
  }
});