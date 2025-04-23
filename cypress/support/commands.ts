Cypress.Commands.add("mockSpoonacular", () => {
    cy.intercept("GET", "https://api.spoonacular.com/recipes/*/information*", {
      statusCode: 200,
      body: {
        id: 639747,
        title: "Red Lentil Soup with Chicken and Turnips",
        description: "A delicious soup recipe.",
        time: "55 minutes",
        servings: 8,
        image: "https://example.com/image.jpg",
        ingredients: ["lentils", "chicken", "turnips"],
        steps: ["Step 1: Heat the oil.", "Step 2: Add ingredients."],
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
      },
    });
  });