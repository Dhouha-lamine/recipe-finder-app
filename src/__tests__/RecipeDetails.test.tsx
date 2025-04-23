import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeDetails from "../components/RecipeDetails";
import { authService } from "../services/authService";
import Parse from "../lib/parseInt";

// ----- MOCK DES SERVICES -----

// Mock complet de authService pour contrôler le comportement sans appels réels
jest.mock("../services/authService", () => ({
  authService: {
    isAuthenticated: jest.fn(),       // Simule si l'utilisateur est connecté
    isRecipeFavorite: jest.fn(),      // Simule si une recette est en favoris
    addToFavorites: jest.fn(),        // Simule l'ajout aux favoris
    removeFromFavorites: jest.fn(),   // Simule le retrait des favoris
  },
}));

// Mock partiel de la lib Parse, uniquement pour Cloud.run
jest.mock("../lib/parseInt", () => {
  const actualParse = jest.requireActual("../lib/parseInt");
  return {
    ...actualParse,
    Cloud: {
      run: jest.fn(), // Simule les appels au backend
    },
  };
});

describe("RecipeDetails", () => {
  // Recette d'exemple utilisée dans les tests
  const sampleRecipe = {
    id: "639747",
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
  };

  // Réinitialisation des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks(); // Réinitialise tous les mocks
    authService.isAuthenticated.mockReturnValue(true); // Simule un utilisateur connecté
  });

  // ----- TESTS -----

  it("renders default recipe when recipeId is undefined", () => {
    // Affiche la recette par défaut si aucun ID n’est fourni
    render(<RecipeDetails />);
    expect(screen.getByText("Pâtes Carbonara")).toBeInTheDocument();
    expect(screen.getByText("A classic Italian pasta dish.")).toBeInTheDocument();
  });

  it("renders recipe details when recipeId is provided", async () => {
    // Simule la réponse backend et l'état non-favori
    Parse.Cloud.run.mockResolvedValue(sampleRecipe);
    authService.isRecipeFavorite.mockResolvedValue(false);

    render(<RecipeDetails recipeId="639747" />);

    // Attente que le composant affiche les données de la recette
    await waitFor(() => {
      expect(screen.getByText("Red Lentil Soup with Chicken and Turnips")).toBeInTheDocument();
    });

    // Vérification de l'affichage des détails de la recette
    expect(screen.getByText("A delicious soup recipe.")).toBeInTheDocument();
    expect(screen.getByText("55 minutes")).toBeInTheDocument();
    expect(screen.getByText("Servings: 8")).toBeInTheDocument();
    expect(screen.getByText("lentils")).toBeInTheDocument();
    expect(screen.getByText("Step 1: Heat the oil.")).toBeInTheDocument();
  });

  it("shows alert when favorite button is clicked without authentication", async () => {
    // Simule un utilisateur non connecté
    authService.isAuthenticated.mockReturnValue(false);
    Parse.Cloud.run.mockResolvedValue(sampleRecipe);

    // Mock de la fonction native alert()
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<RecipeDetails recipeId="639747" />);

    // Attente de l'affichage du bouton favoris
    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    // Simulation du clic sur le bouton favoris
    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    // Vérifie que l'alerte s'affiche
    expect(alertSpy).toHaveBeenCalledWith("Veuillez vous connecter pour ajouter des favoris");
    alertSpy.mockRestore(); // Nettoyage
  });

  it("toggles favorite button between 'Ajouter aux favoris' and 'Ajouté aux favoris'", async () => {
    // Préparation des mocks pour le test du bouton favori
    Parse.Cloud.run.mockResolvedValue(sampleRecipe);
    authService.isRecipeFavorite.mockResolvedValue(false);
    authService.addToFavorites.mockResolvedValue(undefined);
    authService.removeFromFavorites.mockResolvedValue(undefined);

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<RecipeDetails recipeId="639747" />);

    // Attente de l'affichage du bouton
    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    // Clic pour ajouter aux favoris
    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    expect(authService.addToFavorites).toHaveBeenCalledWith("639747");
    expect(alertSpy).toHaveBeenCalledWith("Recette ajoutée aux favoris !");
    expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();

    // Clic pour retirer des favoris
    fireEvent.click(screen.getByText("Ajouté aux favoris"));
    expect(authService.removeFromFavorites).toHaveBeenCalledWith("639747");
    expect(alertSpy).toHaveBeenCalledWith("Recette retirée des favoris !");
    expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();

    alertSpy.mockRestore(); // Nettoyage
  });

  it("displays error message when recipe fetch fails", async () => {
    // Simule une erreur serveur
    Parse.Cloud.run.mockRejectedValue(new Error("API quota exceeded"));

    render(<RecipeDetails recipeId="639747" />);

    // Vérifie que le message d'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText("API quota exceeded")).toBeInTheDocument();
    });
  });
});
