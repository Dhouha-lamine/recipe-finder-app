import React, { useState, useEffect } from "react";
import Parse from "../lib/parseInt";
import { Trash2, Share2, Grid, List, Heart, Clock } from "lucide-react";
import "../styles/favorites.css";
import type { Recipe } from "../types/recipe";

interface FavoritesProps {
  onRecipeClick: (recipeId: string) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ onRecipeClick }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les favoris
  const fetchFavorites = async () => {
    setLoading(true);
    const currentUser = Parse.User.current();
    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const Favorite = Parse.Object.extend("Favorite");
    const query = new Parse.Query(Favorite);
    query.equalTo("user", currentUser);
    try {
      const results = await query.find();
      console.log("Favorite records:", results);

      if (results.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Extraire les recipeIds
      const recipeIds = results.map((favorite) => favorite.get("recipeId"));
      console.log("Recipe IDs:", recipeIds);

      // Fetch full recipe data using getRecipesByIds
      const recipes = await Parse.Cloud.run("getRecipesByIds", { recipeIds });
      console.log("Fetched recipes from Cloud Code:", recipes);

      if (!Array.isArray(recipes)) {
        throw new Error("Expected an array of recipes from getRecipesByIds");
      }

      // Ensure recipes match the Recipe type
      const formattedRecipes: Recipe[] = recipes.map((recipe: any) => ({
        id: recipe.id?.toString(),
        title: recipe.title || "",
        description: recipe.description || "",
        time: recipe.time || "",
        servings: recipe.servings || 0,
        image: recipe.image || "",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        tags: recipe.tags || [],
      }));

      setFavorites(formattedRecipes);
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un favori
  const removeFavorite = async (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation de l'événement

    const currentUser = Parse.User.current();
    if (!currentUser) return;

    const Favorite = Parse.Object.extend("Favorite");
    const query = new Parse.Query(Favorite);
    query.equalTo("user", currentUser);
    query.equalTo("recipeId", recipeId);
    try {
      const favorite = await query.first();
      if (favorite) {
        await favorite.destroy();
        setFavorites(favorites.filter((recipe) => recipe.id !== recipeId));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
    }
  };

  // Partager une recette
  const handleShareRecipe = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation de l'événement

    console.log(`Partage de la recette avec l'ID: ${recipeId}`);
    if (navigator.share) {
      navigator
        .share({
          title: "Recette partagée depuis Recipe Finder",
          text: "Découvrez cette délicieuse recette !",
          url: `${window.location.origin}/recipe/${recipeId}`,
        })
        .catch((error) => console.log("Erreur lors du partage", error));
    } else {
      alert(`Lien de la recette: ${window.location.origin}/recipe/${recipeId}`);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (!Parse.User.current()) {
    return (
      <div className="favorites-page">
        <h1 className="favorites-title">Mes Recettes Favorites</h1>
        <div className="empty-favorites">
          <p>Veuillez vous connecter pour voir vos recettes favorites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">Mes Recettes Favorites</h1>

      <div className="container">
        {/* View mode toggle */}
        <div className="view-toggle">
          <button onClick={() => setViewMode("grid")} className={`view-button ${viewMode === "grid" ? "active" : ""}`}>
            <Grid size={20} />
          </button>
          <button onClick={() => setViewMode("list")} className={`view-button ${viewMode === "list" ? "active" : ""}`}>
            <List size={20} />
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement de vos favoris...</div>
        ) : favorites.length > 0 ? (
          <div className={viewMode === "grid" ? "favorites-grid" : "favorites-list"}>
            {favorites.map((recipe) => (
              <div
                key={recipe.id || recipe.objectId || "unknown"}
                className={`favorite-card ${viewMode === "list" ? "list" : ""}`}
                onClick={() => recipe.id && onRecipeClick(recipe.id)}
              >
                <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="favorite-image" />
                <div className="favorite-content">
                  <h3 className="favorite-title">{recipe.title || "Recette sans titre"}</h3>
                  <div className="favorite-info">
                    <div className="recipe-time">
                      <Clock size={16} />
                      <span>{recipe.time || "N/A"}</span>
                    </div>
                  </div>
                  <div className="favorite-actions">
                    <button onClick={(e) => recipe.id && removeFavorite(recipe.id, e)} className="favorite-action delete">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={(e) => recipe.id && handleShareRecipe(recipe.id, e)} className="favorite-action share">
                      <Share2 size={20} />
                    </button>
                    <button className="favorite-heart">
                      <Heart size={20} fill="currentColor" className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <p>Vous n'avez pas encore de recettes favorites.</p>
            <p>Explorez nos recettes et ajoutez-en à vos favoris !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;