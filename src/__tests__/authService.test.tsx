import { authService } from "../services/authService";
import Parse from "../lib/parseInt";

jest.mock("../lib/parseInt", () => {
  const actualParse = jest.requireActual("../lib/parseInt");

  return {
    ...actualParse,
    User: {
      current: jest.fn(),
      logIn: jest.fn(),
      logOut: jest.fn(),
    },
    Query: jest.fn(),
    Object: {
      extend: jest.fn(),
    },
  };
});

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for Parse.Object.extend
    (Parse.Object.extend as jest.Mock).mockImplementation((className) => {
      return function() {
        return {
          set: jest.fn().mockReturnThis(),
          save: jest.fn().mockResolvedValue(undefined),
          destroy: jest.fn().mockResolvedValue(undefined),
          className,
        };
      };
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when a user is logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });
      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });

    it("returns false when no user is logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);
      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe("login", () => {
    it("successfully logs in a user with valid credentials", async () => {
      const mockUser = { id: "user1", username: "testuser" };
      (Parse.User.logIn as jest.Mock).mockResolvedValue(mockUser);
      const result = await authService.login("testuser", "password");
      expect(result).toEqual(mockUser);
      expect(Parse.User.logIn).toHaveBeenCalledWith("testuser", "password");
    });

    it("throws an error with invalid credentials", async () => {
      (Parse.User.logIn as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));
      await expect(authService.login("testuser", "wrong")).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logout", () => {
    it("clears the current user", async () => {
      (Parse.User.logOut as jest.Mock).mockResolvedValue(undefined);
      await authService.logout();
      expect(Parse.User.logOut).toHaveBeenCalled();
    });
  });

  describe("isRecipeFavorite", () => {
    it("returns false if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);
      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(false);
    });

    it("returns true if recipe is favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

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

      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);
      const result = await authService.isRecipeFavorite("123");
      expect(result).toBe(false);
    });
  });

  describe("addToFavorites", () => {
    it("throws an error if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);
      await expect(authService.addToFavorites("123")).rejects.toThrow("User must be logged in to add favorites");
    });

    it("adds a recipe to favorites if not already favorited", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      const mockQuery = {
        equalTo: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };
      (Parse.Query as unknown as jest.Mock).mockReturnValue(mockQuery);

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

  describe("removeFromFavorites", () => {
    it("throws an error if user is not logged in", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue(null);
      await expect(authService.removeFromFavorites("123")).rejects.toThrow("User must be logged in to remove favorites");
    });

    it("removes a recipe from favorites if it exists", async () => {
      (Parse.User.current as jest.Mock).mockReturnValue({ id: "user1" });

      const destroyMock = jest.fn().mockResolvedValue(undefined);
      const mockFavorite = {
        destroy: destroyMock,
      };
      
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