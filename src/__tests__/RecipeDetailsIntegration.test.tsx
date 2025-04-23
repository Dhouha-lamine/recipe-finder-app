// Importation de React et des outils de test de React Testing Library
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Composant à tester
import RecipeDetails from "../components/RecipeDetails";

// Service d'authentification (mocké plus bas)
import { authService } from "../services/authService";

// Librairie Parse (mockée plus bas)
import Parse from "../lib/parseInt";

// ==== MOCKS ====

// On remplace le vrai service d'authentification par des fonctions factices (mockées)
// pour pouvoir contrôler leur comportement pendant les tests
jest.mock("../../services/authService", () => ({
  authService: {
    isAuthenticated: jest.fn(),        // vérifie si l'utilisateur est connecté
    isRecipeFavorite: jest.fn(),       // vérifie si la recette est en favori
    addToFavorites: jest.fn(),         // ajoute une recette aux favoris
    removeFromFavorites: jest.fn(),    // retire une recette des favoris
  },
}));

// On mock également la méthode Parse.Cloud.run utilisée pour récupérer les détails de la recette
jest.mock("../../lib/parseInt", () => {
  const actualParse = jest.requireActual("../../lib/parseInt");
  return {
    ...actualParse,
    Cloud: {
      run: jest.fn(), // on remplace .run par une fonction simulée
    },
  };
});

// ==== GROUPE DE TESTS ====

describe("RecipeDetails Integration", () => {
  // Exemple de recette simulée utilisée pour les tests
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

  // Avant chaque test, on vide tous les appels précédents et on suppose que l'utilisateur est connecté
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.isAuthenticated as jest.MockedFunction<typeof authService.isAuthenticated>).mockReturnValue(true);
  });

  // === TEST 1 ===
  it("fetches and renders recipe details from getRecipeById", async () => {
    // Simule la récupération réussie de la recette
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.MockedFunction<typeof authService.isRecipeFavorite>).mockResolvedValue(false);

    // Rendu du composant avec l'ID de recette
    render(<RecipeDetails recipeId="639747" />);

    // On attend que le titre s'affiche (preuve que les données ont bien été chargées)
    await waitFor(() => {
      expect(screen.getByText("Red Lentil Soup with Chicken and Turnips")).toBeInTheDocument();
    });

    // Vérifie que la fonction getRecipeById a été appelée avec l'ID correct
    expect(Parse.Cloud.run).toHaveBeenCalledWith("getRecipeById", { recipeId: "639747" });
  });

  // === TEST 2 ===
  it("displays error message if getRecipeById fails", async () => {
    // Simule une erreur de l'API (ex : quota dépassé)
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockRejectedValue(new Error("API quota exceeded"));

    render(<RecipeDetails recipeId="639747" />);

    // On attend que le message d'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText("API quota exceeded")).toBeInTheDocument();
    });
  });

  // === TEST 3 ===
  it("adds a recipe to favorites when button is clicked", async () => {
    // Simule une recette non en favori
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.MockedFunction<typeof authService.isRecipeFavorite>).mockResolvedValue(false);
    (authService.addToFavorites as jest.MockedFunction<typeof authService.addToFavorites>).mockResolvedValue(undefined);

    // Mock de window.alert pour éviter qu'il s'affiche vraiment
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<RecipeDetails recipeId="639747" />);

    // On attend que le bouton "Ajouter aux favoris" apparaisse
    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    // Simule le clic sur le bouton
    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    // Vérifie que la fonction d’ajout a été appelée avec l’ID de recette
    expect(authService.addToFavorites).toHaveBeenCalledWith("639747");

    // Vérifie que l'alerte a été affichée
    expect(alertSpy).toHaveBeenCalledWith("Recette ajoutée aux favoris !");

    // On restaure alert pour les autres tests
    alertSpy.mockRestore();
  });

  // === TEST 4 ===
  it("removes a recipe from favorites when button is clicked", async () => {
    // Simule une recette déjà en favori
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.MockedFunction<typeof authService.isRecipeFavorite>).mockResolvedValue(true);
    (authService.removeFromFavorites as jest.MockedFunction<typeof authService.removeFromFavorites>).mockResolvedValue(undefined);

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<RecipeDetails recipeId="639747" />);

    // On attend que le bouton "Ajouté aux favoris" apparaisse
    await waitFor(() => {
      expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();
    });

    // Simule le clic pour retirer des favoris
    const favoriteButton = screen.getByText("Ajouté aux favoris");
    fireEvent.click(favoriteButton);

    // Vérifie que la fonction de suppression a été appelée avec l’ID
    expect(authService.removeFromFavorites).toHaveBeenCalledWith("639747");

    // Vérifie l'affichage de l'alerte de suppression
    expect(alertSpy).toHaveBeenCalledWith("Recette retirée des favoris !");

    alertSpy.mockRestore();
  });
});
