describe("Recipe Favoriting Flow", () => {
  // Test avec utilisateur connecté
  describe("Utilisateur connecté", () => {
    beforeEach(() => {
      cy.log("Setting up mocks");
      cy.mockSpoonacular();
      cy.intercept("GET", "**/recipes/715415/information**", {
        statusCode: 200,
        body: {
          id: 715415,
          title: "Test Recipe 715415",
          image: "https://example.com/image.jpg",
          readyInMinutes: 30,
          servings: 4,
        },
      }).as("getSpoonacularRecipe");

      cy.intercept("POST", "**/functions/getRecipeById", {
        statusCode: 200,
        body: {
          result: {
            objectId: "715415",
            title: "Test Recipe 715415",
            description: "A test recipe",
            time: "30 minutes",
            servings: 4,
            image: "https://example.com/image.jpg",
            ingredients: ["ing1", "ing2"],
            steps: ["step1", "step2"],
            tags: ["tag1"],
          },
        },
      }).as("getParseRecipe");

      cy.log("Logging in user");
      cy.loginUser("dhouha.lamin@gmail.com", "1972004d");
    });

    it("permet d'ajouter et retirer une recette des favoris", () => {
      cy.log("Accès à la page de détails de la recette");
      cy.visit("/recipes/details/715415");
      cy.wait("@getParseRecipe");
      cy.wait("@getSpoonacularRecipe");
      cy.get(".recipe-details-title").should("be.visible");

      cy.log("Test d'ajout aux favoris");
      cy.get("button").then(($buttons) => {
        if ($buttons.text().includes("Ajouter aux favoris")) {
          cy.contains("button", "Ajouter aux favoris").as("favoriteButton").should("be.visible");
          cy.screenshot("before-favorite");

          cy.get("@favoriteButton").click();
          cy.wait("@addFavorite");

          cy.contains("button", "Ajouté aux favoris").should("be.visible");
          cy.on("window:alert", (text) => {
            expect(text).to.equal("Recette ajoutée aux favoris !");
          });
        } else {
          cy.contains("button", "Ajouté aux favoris").click();
          cy.wait("@removeFavorite");
          cy.contains("button", "Ajouter aux favoris").click();
          cy.wait("@addFavorite");
          cy.contains("button", "Ajouté aux favoris").should("be.visible");
        }
      });

      cy.screenshot("after-favorite");

      cy.log("Vérification dans la page des favoris");
      cy.visit("/favorites");
      cy.wait(2000); // Replace with proper API wait if possible
      cy.contains(".recipe-title", "Test Recipe 715415").should("be.visible");
      cy.screenshot("favorites-page");

      cy.log("Test de retrait des favoris");
      cy.visit("/recipes/details/715415");
      cy.wait("@getParseRecipe");
      cy.wait("@getSpoonacularRecipe");

      cy.contains("button", "Ajouté aux favoris").as("unfavoriteButton").should("be.visible");
      cy.get("@unfavoriteButton").click();
      cy.wait("@removeFavorite");

      cy.contains("button", "Ajouter aux favoris").should("be.visible");
      cy.on("window:alert", (text) => {
        expect(text).to.equal("Recette retirée des favoris !");
      });

      cy.screenshot("after-unfavorite");

      cy.log("Vérification finale dans la page des favoris");
      cy.visit("/favorites");
      cy.wait(2000); // Replace with proper API wait if possible
      cy.contains(".recipe-title", "Test Recipe 715415").should("not.exist");
      cy.contains("Vous n'avez pas encore de recettes favorites").should("be.visible");
      cy.screenshot("favorites-page-after-removal");
    });

    it("handles recipes without an id", () => {
      cy.intercept("POST", "**/functions/getRecipeById", {
        statusCode: 200,
        body: {
          result: {
            // No objectId (id) field
            title: "Test Recipe 715415",
            description: "A test recipe",
            time: "30 minutes",
            servings: 4,
            image: "https://example.com/image.jpg",
            ingredients: ["ing1", "ing2"],
            steps: ["step1", "step2"],
            tags: ["tag1"],
          },
        },
      }).as("getParseRecipe");

      cy.visit("/recipes/details/715415");
      cy.wait("@getParseRecipe");
      cy.wait("@getSpoonacularRecipe");
      cy.get(".recipe-details-title").should("be.visible");
    });
  });

  // Test avec utilisateur non connecté
  describe("Utilisateur non connecté", () => {
    beforeEach(() => {
      cy.log("Setting up mocks for unauthenticated user");
      cy.mockSpoonacular();
      cy.mockParseAuth(false);
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit("/");
      cy.wait(500);
    });

    it("demande à l'utilisateur de se connecter pour ajouter aux favoris", () => {
      cy.log("Accès à la page de détails sans être connecté");
      cy.visit("/recipes/details/715415");
      cy.wait(2000);

      cy.url().should("include", "/recipes/details/715415");
      cy.get(".recipe-details-title").should("be.visible");
      cy.screenshot("recipe-page-not-logged-in");

      cy.log("Tentative d'ajout aux favoris sans être connecté");
      cy.contains("button", "Ajouter aux favoris").click();
      cy.wait("@addFavoriteNotLoggedIn");

      cy.on("window:alert", (text) => {
        expect(text).to.equal("Veuillez vous connecter pour ajouter des favoris");
      });

      cy.screenshot("login-prompt");
      cy.contains("button", "Ajouter aux favoris").should("be.visible");
    });
  });
});