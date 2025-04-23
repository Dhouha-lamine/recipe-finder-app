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
    (authService.isAuthenticated as jest.MockedFunction<typeof authService.isAuthenticated>).mockReturnValue(true);
  });

  it("renders default recipe when recipeId is undefined", () => {
    render(<RecipeDetails />);
    expect(screen.getByText("Pâtes Carbonara")).toBeInTheDocument();
    expect(screen.getByText("A classic Italian pasta dish.")).toBeInTheDocument();
  });

  it("renders recipe details when recipeId is provided", async () => {
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.MockedFunction<typeof authService.isRecipeFavorite>).mockResolvedValue(false);

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Red Lentil Soup with Chicken and Turnips")).toBeInTheDocument();
    });
    expect(screen.getByText("A delicious soup recipe.")).toBeInTheDocument();
    expect(screen.getByText("55 minutes")).toBeInTheDocument();
    expect(screen.getByText("Servings: 8")).toBeInTheDocument();
    expect(screen.getByText("lentils")).toBeInTheDocument();
    expect(screen.getByText("Step 1: Heat the oil.")).toBeInTheDocument();
  });

  it("shows alert when favorite button is clicked without authentication", async () => {
    (authService.isAuthenticated as jest.MockedFunction<typeof authService.isAuthenticated>).mockReturnValue(false);
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockResolvedValue(sampleRecipe);

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    expect(alertSpy).toHaveBeenCalledWith("Veuillez vous connecter pour ajouter des favoris");
    alertSpy.mockRestore();
  });

  it("toggles favorite button between 'Ajouter aux favoris' and 'Ajouté aux favoris'", async () => {
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockResolvedValue(sampleRecipe);
    (authService.isRecipeFavorite as jest.MockedFunction<typeof authService.isRecipeFavorite>).mockResolvedValue(false);
    (authService.addToFavorites as jest.MockedFunction<typeof authService.addToFavorites>).mockResolvedValue(undefined);
    (authService.removeFromFavorites as jest.MockedFunction<typeof authService.removeFromFavorites>).mockResolvedValue(undefined);

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Ajouter aux favoris");
    fireEvent.click(favoriteButton);

    expect(authService.addToFavorites).toHaveBeenCalledWith("639747");
    expect(alertSpy).toHaveBeenCalledWith("Recette ajoutée aux favoris !");
    expect(screen.getByText("Ajouté aux favoris")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Ajouté aux favoris"));
    expect(authService.removeFromFavorites).toHaveBeenCalledWith("639747");
    expect(alertSpy).toHaveBeenCalledWith("Recette retirée des favoris !");
    expect(screen.getByText("Ajouter aux favoris")).toBeInTheDocument();

    alertSpy.mockRestore();
  });

  it("displays error message when recipe fetch fails", async () => {
    (Parse.Cloud.run as jest.MockedFunction<typeof Parse.Cloud.run>).mockRejectedValue(new Error("API quota exceeded"));

    render(<RecipeDetails recipeId="639747" />);

    await waitFor(() => {
      expect(screen.getByText("API quota exceeded")).toBeInTheDocument();
    });
  });
});