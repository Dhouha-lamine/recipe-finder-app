import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeDetails from "../components/RecipeDetails";
import * as authServiceModule from "../services/authService";
import Parse from "../lib/parseInt";

// Mock authService
jest.mock("../services/authService", () => {
  return {
    authService: {
      isAuthenticated: jest.fn(),
      isRecipeFavorite: jest.fn(),
      addToFavorites: jest.fn(),
      removeFromFavorites: jest.fn(),
    },
  };
});

// Mock Parse.Cloud.run
jest.mock("../lib/parseInt", () => {
  const actualParse = jest.requireActual("../lib/parseInt");
  return {
    ...actualParse,
    Cloud: {
      run: jest.fn(),
    },
  };
});

// Mock window.alert
const alertMock = jest.fn();
global.alert = alertMock;

// Mock console.log to suppress specific logs during tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Utilisateur non authentifié, affichage de l\'alerte.')) {
      return;
    }
    originalConsoleLog(...args);
  };
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe("RecipeDetails", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (authServiceModule.authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
    alertMock.mockClear();
  });

  it("renders default recipe when recipeId is undefined", () => {
    render(<RecipeDetails />);
    expect(screen.getByText("Pâtes Carbonara")).toBeInTheDocument();
    expect(screen.getByText("Une recette italienne classique, crémeuse et savoureuse.")).toBeInTheDocument();
  });

  it("renders recipe details when recipeId is provided", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authServiceModule.authService.isRecipeFavorite as jest.Mock).mockResolvedValue(false);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Red Lentil Soup with Chicken and Turnips")).toBeInTheDocument();
    });
    expect(screen.getByText("A delicious soup recipe.")).toBeInTheDocument();
    expect(screen.getByText("55 minutes")).toBeInTheDocument();
    expect(screen.getByText("8 personnes")).toBeInTheDocument();
    expect(screen.getByText("lentils")).toBeInTheDocument();
    expect(screen.getByText("Step 1: Heat the oil.")).toBeInTheDocument();
  });

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

    await waitFor(() => expect(authServiceModule.authService.addToFavorites).toHaveBeenCalledWith("639747"));
    expect(alertMock).toHaveBeenCalledWith("Recette ajoutée aux favoris !");
    expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Ajouté aux favoris"));

    await waitFor(() => {
      expect(authServiceModule.authService.removeFromFavorites).toHaveBeenCalledWith("639747");
    });

    expect(alertMock).toHaveBeenCalledWith("Recette retirée des favoris !");
    expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
  });

  it("displays error message when recipe fetch fails", async () => {
    (Parse.Cloud.run as jest.Mock).mockRejectedValue(new Error("API quota exceeded"));

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("API quota exceeded")).toBeInTheDocument();
    });
  });
});