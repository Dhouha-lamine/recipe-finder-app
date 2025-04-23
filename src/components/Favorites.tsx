import React, { useState, useEffect } from "react";
import Parse from "../lib/parseInt"
import { Trash2, Share2, Grid, List, Heart, Clock } from "lucide-react";
import "../styles/favorites.css";

interface Recipe {
  id: string
  title: string
  image: string
  time?: string
  cookingTime?: number
  ingredients?: string[]
}

interface FavoritesProps {
  onRecipeClick: (recipeId: string) => void
}

const Favorites: React.FC<FavoritesProps> = ({ onRecipeClick }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  // Charger les favoris
  const fetchFavorites = async () => {
    setLoading(true)
    const currentUser = Parse.User.current()
    if (!currentUser) {
      setFavorites([])
      setLoading(false)
      return
    }

    const Favorite = Parse.Object.extend("Favorite")
    const query = new Parse.Query(Favorite)
    query.equalTo("user", currentUser)
    try {
      const results = await query.find()

      if (results.length === 0) {
        setFavorites([])
        setLoading(false)
        return
      }

      // Extraire les informations des favoris directement
      const fetchedFavorites: Recipe[] = results.map((favorite) => ({
        id: favorite.get("recipeId") || favorite.id,
        title: favorite.get("recipeTitle") || "Recette sans titre",
        image: favorite.get("recipeImage") || "https://via.placeholder.com/300x200?text=Recette",
        time: favorite.get("recipeTime") || "N/A",
      }))

      setFavorites(fetchedFavorites)
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris:", error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un favori
  const removeFavorite = async (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher la propagation de l'événement

    const currentUser = Parse.User.current()
    if (!currentUser) return

    const Favorite = Parse.Object.extend("Favorite")
    const query = new Parse.Query(Favorite)
    query.equalTo("user", currentUser)
    query.equalTo("recipeId", recipeId)
    try {
      const favorite = await query.first()
      if (favorite) {
        await favorite.destroy()
        setFavorites(favorites.filter((recipe) => recipe.id !== recipeId))
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error)
    }
  }

  // Partager une recette
  const handleShareRecipe = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher la propagation de l'événement

    console.log(`Partage de la recette avec l'ID: ${recipeId}`)
    // Implémentation du partage (pourrait utiliser l'API Web Share si disponible)
    if (navigator.share) {
      navigator
        .share({
          title: "Recette partagée depuis Recipe Finder",
          text: "Découvrez cette délicieuse recette !",
          url: `${window.location.origin}/recipe/${recipeId}`,
        })
        .catch((error) => console.log("Erreur lors du partage", error))
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      alert(`Lien de la recette: ${window.location.origin}/recipe/${recipeId}`)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  if (!Parse.User.current()) {
    return (
      <div className="favorites-page">
        <h1 className="favorites-title">Mes Recettes Favorites</h1>
        <div className="empty-favorites">
          <p>Veuillez vous connecter pour voir vos recettes favorites.</p>
        </div>
      </div>
    )
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
                key={recipe.id}
                className={`favorite-card ${viewMode === "list" ? "list" : ""}`}
                onClick={() => onRecipeClick(recipe.id)}
              >
                <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="favorite-image" />
                <div className="favorite-content">
                  <h3 className="favorite-title">{recipe.title}</h3>
                  <div className="favorite-info">
                    <div className="recipe-time">
                      <Clock size={16} />
                      <span>{recipe.time || (recipe.cookingTime ? `${recipe.cookingTime} min` : "N/A")}</span>
                    </div>
                  </div>
                  <div className="favorite-actions">
                    <button onClick={(e) => removeFavorite(recipe.id, e)} className="favorite-action delete">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={(e) => handleShareRecipe(recipe.id, e)} className="favorite-action share">
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
  )
}

export default Favorites
