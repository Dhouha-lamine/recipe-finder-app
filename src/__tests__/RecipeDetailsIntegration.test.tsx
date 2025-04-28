import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeDetails from "../components/RecipeDetails";
import { authService } from "../services/authService";
import Parse from "../lib/parseInt";

// Mock de authService pour isoler le test de toute logique réseau réelle
jest.mock("../services/authService", () => ({
  authService: {
    isAuthenticated: jest.fn(),  // Simuler la vérification d'authentification
    isRecipeFavorite: jest.fn(), // Simuler la vérification si une recette est favorite
    addToFavorites: jest.fn(),   // Simuler l'ajout aux favoris
    removeFromFavorites: jest.fn(), // Simuler la suppression des favoris
  },
}));

// Mock de Parse.Cloud.run pour simuler les appels API sans vraiment interroger un serveur
jest.mock("../lib/parseInt", () => {
  const actualParse = jest.requireActual("../lib/parseInt");
  return {
    ...actualParse,
    Cloud: {
      run: jest.fn(), // Simuler l'appel à l'API cloud
    },
  };
});

// Mock de window.alert pour éviter les vraies pop-ups lors des tests
const alertMock = jest.fn();
global.alert = alertMock;

// Début du bloc de tests pour le composant RecipeDetails
describe("RecipeDetails Integration", () => {
  // Recette d'exemple pour alimenter les tests
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

  // Avant chaque test, on nettoie les mocks
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.isAuthenticated as jest.Mock).mockResolvedValue(true); // Simule que l'utilisateur est authentifié
    alertMock.mockClear();
  });

  // Test : récupération et affichage des détails d'une recette
  it("fetches and renders recipe details from getRecipeById", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe); // Simuler une réponse positive
    (authService.isRecipeFavorite as jest.Mock).mockResolvedValue(false);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Red Lentil Soup with Chicken and Turnips")).toBeInTheDocument(); // Vérifie que le titre est affiché
    });

    expect(Parse.Cloud.run).toHaveBeenCalledWith("getRecipeById", { recipeId: "639747" }); // Vérifie que l'appel API a été fait avec le bon paramètre
  });

  // Test : affichage d'un message d'erreur si l'API échoue
  it("displays error message if getRecipeById fails", async () => {
    (Parse.Cloud.run as jest.Mock).mockRejectedValue(new Error("API quota exceeded")); // Simuler une erreur API

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("API quota exceeded")).toBeInTheDocument(); // Vérifie que l'erreur est affichée
    });
  });

  // Test : ajout d'une recette aux favoris
  it("adds a recipe to favorites when button is clicked", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.Mock).mockResolvedValue(false);
    (authService.addToFavorites as jest.Mock).mockResolvedValue(undefined);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton); // Simule le clic

    await waitFor(() => {
      expect(authService.addToFavorites).toHaveBeenCalledWith("639747"); // Vérifie que l'ajout a été demandé
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Recette ajoutée aux favoris !"); // Vérifie que l'alerte a été affichée
    });

    await waitFor(() => {
      expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument(); // Vérifie que le bouton a changé d'état
    });
  });

  // Test : suppression d'une recette des favoris
  it("removes a recipe from favorites when button is clicked", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.Mock).mockResolvedValue(true);
    (authService.removeFromFavorites as jest.Mock).mockResolvedValue(undefined);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouté aux favoris");
    fireEvent.click(favoriteButton); // Simule le clic

    await waitFor(() => {
      expect(authService.removeFromFavorites).toHaveBeenCalledWith("639747"); // Vérifie que la suppression a été demandée
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Recette retirée des favoris !"); // Vérifie que l'alerte a été affichée
    });

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument(); // Vérifie que le bouton est revenu à l'état initial
    });
  });
});
