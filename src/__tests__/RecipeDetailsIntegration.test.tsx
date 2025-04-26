import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeDetails from "../components/RecipeDetails";
import { authService } from "../services/authService";
import Parse from "../lib/parseInt";

// Mock authService
jest.mock("../services/authService", () => ({
  authService: {
    isAuthenticated: jest.fn(),
    isRecipeFavorite: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
  },
}));

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

describe("RecipeDetails Integration", () => {
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
    (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
    alertMock.mockClear();
  });

  it("fetches and renders recipe details from getRecipeById", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.Mock).mockResolvedValue(false);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Red Lentil Soup with Chicken and Turnips")).toBeInTheDocument();
    });
    expect(Parse.Cloud.run).toHaveBeenCalledWith("getRecipeById", { recipeId: "639747" });
  });

  it("displays error message if getRecipeById fails", async () => {
    (Parse.Cloud.run as jest.Mock).mockRejectedValue(new Error("API quota exceeded"));

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("API quota exceeded")).toBeInTheDocument();
    });
  });

  it("adds a recipe to favorites when button is clicked", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.Mock).mockResolvedValue(false);
    (authService.addToFavorites as jest.Mock).mockResolvedValue(undefined);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(authService.addToFavorites).toHaveBeenCalledWith("639747");
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Recette ajoutée aux favoris !");
    });

    await waitFor(() => {
      expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();
    });
  });

  it("removes a recipe from favorites when button is clicked", async () => {
    (Parse.Cloud.run as jest.Mock).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.Mock).mockResolvedValue(true);
    (authService.removeFromFavorites as jest.Mock).mockResolvedValue(undefined);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouté aux favoris");
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(authService.removeFromFavorites).toHaveBeenCalledWith("639747");
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Recette retirée des favoris !");
    });

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });
  });
});