// Import du service d'authentification à tester
import { authService } from "../services/authService";

// Import de la librairie Parse (mockée ensuite)
import Parse from "../lib/parseInt";

// Mock de la librairie Parse pour remplacer certaines fonctionnalités pendant les tests
jest.mock("../lib/parseInt", () => {
  const actualParse = jest.requireActual("../lib/parseInt");

  return {
    ...actualParse,
    User: {
      current: jest.fn(), // fonction mockée pour obtenir l'utilisateur actuel
      logIn: jest.fn(),    // fonction mockée pour la connexion
      logOut: jest.fn(),   // fonction mockée pour la déconnexion
    },
    Query: jest.fn(),      // fonction mockée pour créer une requête
    Object: {
      extend: jest.fn(),   // fonction mockée pour étendre un objet (classe Parse)
    },
  };
});

// Début du bloc de test pour authService
describe("authService", () => {

  // Avant chaque test, on réinitialise les mocks
  beforeEach(() => {
    jest.clearAllMocks();

    // On définit comment Parse.Object.extend doit se comporter dans les tests
    (Parse.Object.extend as jest.Mock).mockImplementation((className) => {
      return function() {
        return {
          set: jest.fn().mockReturnThis(),        // mock de la méthode 'set'
          save: jest.fn().mockResolvedValue(undefined), // mock de la méthode 'save'
          destroy: jest.fn().mockResolvedValue(undefined), // mock de la méthode 'destroy'
          className,                             // sauvegarde du nom de la classe
        };
      };
    });
  });

  // Tests pour vérifier si l'utilisateur est connecté
  describe("isAuthenticated", () => {
    it("returns true when a user is logged in", async () => {
      // Simuler un utilisateur connecté
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });

    it("returns false when no user is logged in", async () => {
      // Simuler aucun utilisateur connecté
      (Parse.User.current as jest.Mock).mockReturnValue(null);

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  // Tests pour la fonction de connexion
  describe("login", () => {
    it("successfully logs in a user with valid credentials", async () => {
      // Simuler un utilisateur connecté avec succès
      const mockUser = { id: "user1", username: "testuser" };
      (Parse.User.logIn as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login("testuser", "password");
      expect(result).toEqual(mockUser);
      expect(Parse.User.logIn).toHaveBeenCalledWith("testuser", "password");
    });

    it("throws an error with invalid credentials", async () => {
      // Simuler une erreur de connexion
      (Parse.User.logIn as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));

      await expect(authService.login("testuser", "wrong")).rejects.toThrow("Invalid credentials");
    });
  });

  // Tests pour la fonction de déconnexion
  describe("logout", () => {
    it("clears the current user", async () => {
      // Simuler une déconnexion réussie
      (Parse.User.logOut as jest.Mock).mockResolvedValue(undefined);

      await authService.logout();
      expect(Parse.User.logOut).toHaveBeenCalled();
    });
  });

  // Tests pour vérifier si une recette est en favori
  describe("isRecipeFavorite", () => {
    it("returns false if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);

      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(false);
    });

    it("returns true if recipe is favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Mock de la requête pour trouver une recette en favoris
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: "fav1" }),
      };
      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);

      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(true);
    });

    it("returns false if recipe is not favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Simuler aucune recette trouvée
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };
      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);

      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(false);
    });
  });

  // Tests pour ajouter une recette aux favoris
  describe("addToFavorites", () => {
    it("throws an error if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);

      await expect(authService.addToFavorites("123"))
        .rejects.toThrow("User must be logged in to add favorites");
    });

    it("adds a recipe to favorites if not already favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Simuler que la recette n'est pas déjà en favori
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };
      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);

      // Mock de l'instance Favorite
      const mockFavoriteInstance = {
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(undefined),
      };

      (Parse.Object.extend as jest.Mock).mockImplementation(() => {
        return function() {
          return mockFavoriteInstance;
        };
      });

      await authService.addToFavorites("123");

      expect(mockFavoriteInstance.set).toHaveBeenCalledWith("user", { id: "user1" });
      expect(mockFavoriteInstance.set).toHaveBeenCalledWith("recipeId", "123");
      expect(mockFavoriteInstance.save).toHaveBeenCalled();
    });

    it("does nothing if recipe is already favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Simuler que la recette est déjà dans les favoris
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: "fav1" }),
      };
      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);

      const saveMock = jest.fn();
      (Parse.Object.extend as jest.Mock).mockImplementation(() => {
        return function() {
          return {
            set: jest.fn(),
            save: saveMock,
          };
        };
      });

      await authService.addToFavorites("123");
      expect(saveMock).not.toHaveBeenCalled();
    });
  });

  // Tests pour retirer une recette des favoris
  describe("removeFromFavorites", () => {
    it("throws an error if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);

      await expect(authService.removeFromFavorites("123"))
        .rejects.toThrow("User must be logged in to remove favorites");
    });

    it("removes a recipe from favorites if it exists", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Simuler qu'on trouve le favori à supprimer
      const destroyMock = jest.fn().mockResolvedValue(undefined);
      const mockFavorite = { destroy: destroyMock };

      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockFavorite),
      };
      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);

      await authService.removeFromFavorites("123");
      expect(destroyMock).toHaveBeenCalled();
    });

    it("does nothing if recipe is not in favorites", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Simuler que le favori n'existe pas
      const destroyMock = jest.fn();
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };
      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);

      await authService.removeFromFavorites("123");
      expect(destroyMock).not.toHaveBeenCalled();
    });
  });
});
