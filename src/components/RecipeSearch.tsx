import React, { useState, useEffect } from "react";
import Parse from '../lib/parseInt';
import "../styles/recipesearch.css";
import { Search } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  time: string;
  servings: number;
  image: string;
  ingredients: string[];
  steps: string[];
}

interface RecipeSearchProps {
  onRecipeClick: (recipeId: string) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ onRecipeClick }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const fetchedRecipes = await Parse.Cloud.run("fetchRecipes", { query });
      console.log("Fetched recipes from Cloud Code:", fetchedRecipes);
      setRecipes(fetchedRecipes || []);
    } catch (err: any) {
      console.error("Error fetching recipes:", err);
      setError(err.message || "Erreur lors de la récupération des recettes.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les recettes au montage du composant
  useEffect(() => {
    fetchRecipes(""); // Charger toutes les recettes initialement
  }, []);

  // Mettre à jour les recettes lors de la recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      fetchRecipes(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="search-page">
      <h1 className="search-page-title">Recherche de Recettes</h1>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher une recette..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-box-input"
          />
          <button className="search-box-button" aria-label="Rechercher">
            <Search size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Chargement des recettes...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : recipes.length > 0 ? (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card" onClick={() => onRecipeClick(recipe.id)}>
              <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="recipe-image" />
              <div className="recipe-content">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-description">{recipe.description}</p>
                <button className="recipe-button">Voir la recette</button>
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery.trim() ? (
        <div className="no-recipes">
          Aucune recette trouvée pour "{searchQuery}". Essayez un autre terme de recherche.
        </div>
      ) : (
        <div className="no-recipes">
          Entrez un terme de recherche pour trouver des recettes.
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;