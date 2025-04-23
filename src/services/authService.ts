import Parse from "../lib/parseInt";

class AuthService {
  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const currentUser = Parse.User.current();
    console.log("isAuthenticated - Current user:", currentUser ? currentUser.id : "No user");
    return !!currentUser;
  }

  // Ajouter une recette aux favoris
  async addToFavorites(recipeId: string): Promise<void> {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("User must be logged in to add favorites");
    }

    console.log("addToFavorites - Recipe ID:", recipeId);
    console.log("addToFavorites - Current user:", currentUser.id);

    // Récupérer les détails de la recette pour stocker les informations nécessaires
    const recipeData = await Parse.Cloud.run("getRecipeById", { recipeId });
    if (!recipeData) {
      throw new Error("Recipe not found");
    }
    console.log("addToFavorites - Recipe data fetched:", recipeData);

    const Favorite = Parse.Object.extend("Favorite");
    const query = new Parse.Query(Favorite);
    query.equalTo("user", currentUser);
    query.equalTo("recipeId", recipeId);
    const existingFavorite = await query.first();
    console.log("addToFavorites - Existing favorite:", existingFavorite ? existingFavorite.id : "None");

    if (!existingFavorite) {
      const favorite = new Favorite();
      favorite.set("user", currentUser);
      favorite.set("recipeId", recipeId);
      favorite.set("recipeTitle", recipeData.title);
      favorite.set("recipeImage", recipeData.image);
      favorite.set("recipeTime", recipeData.time);

      // Définir un ACL pour permettre à l'utilisateur actuel de lire et écrire
      const acl = new Parse.ACL(currentUser);
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
      favorite.setACL(acl);
      console.log("addToFavorites - ACL set for user:", currentUser.id);

      await favorite.save();
      console.log("addToFavorites - Favorite saved successfully:", favorite.id);
    }
  }

  // Retirer une recette des favoris
  async removeFromFavorites(recipeId: string): Promise<void> {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("User must be logged in to remove favorites");
    }

    console.log("removeFromFavorites - Recipe ID:", recipeId);
    console.log("removeFromFavorites - Current user:", currentUser.id);

    const Favorite = Parse.Object.extend("Favorite");
    const query = new Parse.Query(Favorite);
    query.equalTo("user", currentUser);
    query.equalTo("recipeId", recipeId);
    const favorite = await query.first();
    console.log("removeFromFavorites - Favorite found:", favorite ? favorite.id : "None");

    if (favorite) {
      await favorite.destroy();
      console.log("removeFromFavorites - Favorite deleted successfully");
    }
  }

  // Vérifier si une recette est dans les favoris
  async isRecipeFavorite(recipeId: string): Promise<boolean> {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      console.log("isRecipeFavorite - No current user, returning false");
      return false;
    }

    console.log("isRecipeFavorite - Recipe ID:", recipeId);
    console.log("isRecipeFavorite - Current user:", currentUser.id);

    const Favorite = Parse.Object.extend("Favorite");
    const query = new Parse.Query(Favorite);
    query.equalTo("user", currentUser);
    query.equalTo("recipeId", recipeId);
    const favorite = await query.first();
    console.log("isRecipeFavorite - Favorite found:", favorite ? favorite.id : "None");

    return !!favorite;
  }

  // Connexion
  async login(username: string, password: string): Promise<void> {
    await Parse.User.logIn(username, password);
    console.log("login - User logged in:", Parse.User.current()?.id);
  }

  // Inscription
  async signup(username: string, password: string, email: string): Promise<void> {
    const user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    user.set("email", email);
    await user.signUp();
    console.log("signup - User signed up:", Parse.User.current()?.id);
  }

  // Déconnexion
  async logout(): Promise<void> {
    await Parse.User.logOut();
    console.log("logout - User logged out");
  }
}

export const authService = new AuthService();