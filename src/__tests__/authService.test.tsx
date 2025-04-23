// Importation du service à tester
import { authService } from "../services/authService";

// Importation du module Parse (qu'on va mocker juste après)
import Parse from "../lib/parseInt";

// On remplace certaines fonctions de Parse par des fonctions factices (mock)
jest.mock("../lib/parseInt", () => {
  const actualParse = jest.requireActual("../lib/parseInt"); // on garde les vraies fonctions sauf celles qu'on veut remplacer

  return {
    ...actualParse,
    // Mock des fonctions liées à l'utilisateur
    User: {
      current: jest.fn(), // renvoie l'utilisateur actuel ou null
      logIn: jest.fn(),   // simule la connexion
      logOut: jest.fn(),  // simule la déconnexion
    },
    // Mock d'un constructeur de requête
    Query: jest.fn(),
    // Mock pour créer de nouveaux objets Parse (ex : favoris)
    Object: {
      extend: jest.fn(),
    },
  };
});

// Début de la suite de tests
describe("authService", () => {
  // Avant chaque test, on réinitialise tous les mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 🔐 Test de la fonction isAuthenticated
  describe("isAuthenticated", () => {
    it("returns true when a user is logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" }); // Simule un utilisateur connecté
      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });

    it("returns false when no user is logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null); // Aucun utilisateur
      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  // 🔑 Test de la fonction login
  describe("login", () => {
    it("successfully logs in a user with valid credentials", async () => {
      const mockUser = { id: "user1", username: "testuser" };
      (Parse.User.logIn as jest.Mock).mockResolvedValue(mockUser); // Simule succès login
      const result = await authService.login("testuser", "password");
      expect(result).toEqual(mockUser); // Résultat attendu
      expect(Parse.User.logIn).toHaveBeenCalledWith("testuser", "password"); // Vérifie appel
    });

    it("throws an error with invalid credentials", async () => {
      (Parse.User.logIn as jest.Mock).mockRejectedValue(new Error("Invalid credentials")); // Simule échec
      await expect(authService.login("testuser", "wrong")).rejects.toThrow("Invalid credentials");
    });
  });

  // 🔓 Test de la fonction logout
  describe("logout", () => {
    it("clears the current user", async () => {
      (Parse.User.logOut as jest.Mock).mockResolvedValue(undefined);
      await authService.logout();
      expect(Parse.User.logOut).toHaveBeenCalled(); // Vérifie si appel fait
    });
  });

  // ⭐ Test de la fonction isRecipeFavorite
  describe("isRecipeFavorite", () => {
    it("returns false if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);
      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(false);
    });

    it("returns true if recipe is favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Mock d'une requête qui trouve un favori
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(), // permet d’enchaîner .equalTo()
        first: jest.fn().mockResolvedValue({ id: "fav1" }), // retourne un favori
      };

      (Parse.Query as jest.Mock).mockReturnValue(mockQuery);
      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(true);
    });

    it("returns false if recipe is not favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null), // aucun favori trouvé
      };

      (Parse.Query as jest.Mock).mockReturnValue(mockQuery);
      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(false);
    });
  });

  // ➕ Test de la fonction addToFavorites
  describe("addToFavorites", () => {
    it("throws an error if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);
      await expect(authService.addToFavorites("123")).rejects.toThrow("User not logged in");
    });

    it("adds a recipe to favorites if not already favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      // Simule qu’aucun favori n’existe
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };
      (Parse.Query as jest.Mock).mockReturnValue(mockQuery);

      // Mock de création de favori
      const mockFavorite = {
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(undefined),
      };
      (Parse.Object.extend as jest.Mock).mockReturnValue(() => mockFavorite);

      await authService.addToFavorites("123");
      expect(mockFavorite.set).toHaveBeenCalledWith("user", { id: "user1" });
      expect(mockFavorite.set).toHaveBeenCalledWith("recipeId", "123");
      expect(mockFavorite.save).toHaveBeenCalled();
    });

    it("does nothing if recipe is already favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: "fav1" }), // favori déjà présent
      };
      (Parse.Query as jest.Mock).mockReturnValue(mockQuery);

      const mockFavorite = {
        set: jest.fn(),
        save: jest.fn(),
      };
      (Parse.Object.extend as jest.Mock).mockReturnValue(() => mockFavorite);

      await authService.addToFavorites("123");
      expect(mockFavorite.save).not.toHaveBeenCalled(); // Rien ne se passe
    });
  });

  // ➖ Test de la fonction removeFromFavorites
  describe("removeFromFavorites", () => {
    it("throws an error if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);
      await expect(authService.removeFromFavorites("123")).rejects.toThrow("User not logged in");
    });

    it("removes a recipe from favorites if it exists", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      const mockFavorite = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockFavorite), // favori à supprimer
      };
      (Parse.Query as jest.Mock).mockReturnValue(mockQuery);

      await authService.removeFromFavorites("123");
      expect(mockFavorite.destroy).toHaveBeenCalled();
    });
  });
});
