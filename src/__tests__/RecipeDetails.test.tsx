// On importe les librairies nécessaires pour le test
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeDetails from "../components/RecipeDetails";
import * as authServiceModule from "../services/authService";
import Parse from "../lib/parseInt";

// Mock du service d'authentification pour éviter les vrais appels réseau
jest.mock("../services/authService", () => {
  return {
    authService: {
      isAuthenticated: jest.fn(),  // on simule l'authentification
      isRecipeFavorite: jest.fn(), // on simule si une recette est favorite
      addToFavorites: jest.fn(),   // on simule l'ajout d'une recette aux favoris
      removeFromFavorites: jest.fn(), // on simule la suppression d'une recette des favoris
    },
  };
});

// Mock de Parse.Cloud.run pour simuler les appels au backend
jest.mock("../lib/parseInt", () => {
  const actualParse = jest.requireActual("../lib/parseInt");
  return {
    ...actualParse,
    Cloud: {
      run: jest.fn(), // on remplace la méthode 'run' par un faux comportement
    },
  };
});

// Mock de window.alert pour capturer les alertes sans ouvrir de vraie boîte de dialogue
const alertMock = jest.fn();
global.alert = alertMock;

// Suppression de certains console.log inutiles pendant les tests pour garder la console propre
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Utilisateur non authentifié, affichage de l\'alerte.')) {
      return; // on ignore ce log spécifique
    }
    originalConsoleLog(...args);
  };
});

// Remettre console.log à la normale après tous les tests
afterAll(() => {
  console.log = originalConsoleLog;
});

describe("RecipeDetails", () => {
  // Données de recette factices pour les tests
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

  // Avant chaque test, on réinitialise tous les mocks
  beforeEach(() => {
    jest.clearAllMocks();
    (authServiceModule.authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
    alertMock.mockClear();
  });

  // Test 1 : vérifier que la recette par défaut s'affiche si aucun id n'est fourni
  it("renders default recipe when recipeId is undefined", () => {
    render(<RecipeDetails />);
    expect(screen.getByText("Pâtes Carbonara")).toBeInTheDocument();
    expect(screen.getByText("Une recette italienne classique, crémeuse et savoureuse.")).toBeInTheDocument();
  });

  // Test 2 : vérifier que les détails d'une recette spécifique s'affichent si un id est fourni
  it("renders recipe details when recipeId is provided", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authServiceModule.authService.isRecipeFavorite as jest.Mock).mockResolvedValue(false);

    render(<RecipeDetails recipeId="639747" />);

    // attendre que les éléments soient rendus
    await waitFor(() => {
      expect(screen.getByText("Red Lentil Soup with Chicken and Turnips")).toBeInTheDocument();
    });
    expect(screen.getByText("A delicious soup recipe.")).toBeInTheDocument();
    expect(screen.getByText("55 minutes")).toBeInTheDocument();
    expect(screen.getByText("8 personnes")).toBeInTheDocument();
    expect(screen.getByText("lentils")).toBeInTheDocument();
    expect(screen.getByText("Step 1: Heat the oil.")).toBeInTheDocument();
  });

  // Test 3 : vérifier que l'utilisateur voit une alerte s'il essaie d'ajouter aux favoris sans être connecté
  it("shows alert when favorite button is clicked without authentication", async () => {
    (authServiceModule.authService.isAuthenticated as jest.Mock).mockResolvedValue(false);
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Veuillez vous connecter pour ajouter des favoris");
    });
  });

  // Test 4 : vérifier que le bouton favoris alterne bien entre "Ajouter aux favoris" et "Ajouté aux favoris"
  it("toggles favorite button between 'Ajouter aux favoris' and 'Ajouté aux favoris'", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authServiceModule.authService.isRecipeFavorite as jest.Mock).mockResolvedValue(false);
    (authServiceModule.authService.addToFavorites as jest.Mock).mockResolvedValue(undefined);
    (authServiceModule.authService.removeFromFavorites as jest.Mock).mockResolvedValue(undefined);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    // Vérification de l'ajout aux favoris
    await waitFor(() => expect(authServiceModule.authService.addToFavorites).toHaveBeenCalledWith("639747"));
    expect(alertMock).toHaveBeenCalledWith("Recette ajoutée aux favoris !");
    expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();

    // Maintenant, on teste le retrait des favoris
    fireEvent.click(screen.getByText("Ajouté aux favoris"));

    await waitFor(() => {
      expect(authServiceModule.authService.removeFromFavorites).toHaveBeenCalledWith("639747");
    });

    expect(alertMock).toHaveBeenCalledWith("Recette retirée des favoris !");
    expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
  });

  // Test 5 : vérifier que le message d'erreur s'affiche si la récupération de la recette échoue
  it("displays error message when recipe fetch fails", async () => {
    (Parse.Cloud.run as jest.Mock).mockRejectedValue(new Error("API quota exceeded"));

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("API quota exceeded")).toBeInTheDocument();
    });
  });
});
