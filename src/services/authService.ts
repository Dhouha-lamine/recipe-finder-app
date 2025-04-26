import Parse from "../lib/parseInt";

class AuthService {
  async isAuthenticated(): Promise<boolean> {
    try {
      const currentUser = Parse.User.current();
      if (!currentUser) {
        if (process.env.NODE_ENV !== 'test') {
          console.log("isAuthenticated - No current user");
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error in isAuthenticated:", error);
      return false;
    }
  }

  async login(username: string, password: string): Promise<Parse.User> {
    const user = await Parse.User.logIn(username, password);
    if (process.env.NODE_ENV !== 'test') {
      console.log("login - User logged in:", user?.id);
    }
    return user as unknown as Parse.User;
  }

  async logout(): Promise<void> {
    await Parse.User.logOut();
    if (process.env.NODE_ENV !== 'test') {
      console.log("logout - User logged out");
    }
  }

  async isRecipeFavorite(recipeId: string): Promise<boolean> {
    try {
      const currentUser = Parse.User.current();
      if (!currentUser) {
        if (process.env.NODE_ENV !== 'test') {
          console.log("isRecipeFavorite - No current user, returning false");
        }
        return false;
      }

      const query = new Parse.Query("Favorite");
      query.equalTo("user", currentUser);
      query.equalTo("recipeId", recipeId);
      const favorite = await query.first();
      return !!favorite;
    } catch (error) {
      console.error("Error in isRecipeFavorite:", error);
      return false;
    }
  }

  async addToFavorites(recipeId: string): Promise<void> {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("User must be logged in to add favorites");
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log("addToFavorites - Recipe ID:", recipeId);
    }

    const query = new Parse.Query("Favorite");
    query.equalTo("user", currentUser);
    query.equalTo("recipeId", recipeId);
    const existingFavorite = await query.first();
    if (existingFavorite) {
      if (process.env.NODE_ENV !== 'test') {
        console.log("addToFavorites - Recipe already favorited:", recipeId);
      }
      return;
    }

    const Favorite = Parse.Object.extend("Favorite");
    const favorite = new Favorite();
    favorite.set("user", currentUser);
    favorite.set("recipeId", recipeId);
    await favorite.save();
    if (process.env.NODE_ENV !== 'test') {
      console.log("addToFavorites - Recipe added to favorites:", recipeId);
    }
  }

  async removeFromFavorites(recipeId: string): Promise<void> {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("User must be logged in to remove favorites");
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log("removeFromFavorites - Recipe ID:", recipeId);
    }

    const query = new Parse.Query("Favorite");
    query.equalTo("user", currentUser);
    query.equalTo("recipeId", recipeId);
    const favorite = await query.first();
    if (favorite) {
      await favorite.destroy();
      if (process.env.NODE_ENV !== 'test') {
        console.log("removeFromFavorites - Recipe removed from favorites:", recipeId);
      }
    }
  }
}

export const authService = new AuthService();