import React from "react";
import { useState, useEffect } from "react"
import { recipeService } from "../services/recipeService"
import type { Recipe } from "../types/recipe"

const RecipeList = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
  })

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        // Si des filtres sont actifs, utiliser filterRecipes, sinon getAllRecipes
        const activeFilters = Object.values(filters).some(Boolean)
        const fetchedRecipes = activeFilters
          ? await recipeService.filterRecipes(filters)
          : await recipeService.getAllRecipes()
        setRecipes(fetchedRecipes)
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des recettes")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [filters])

  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des recettes...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <div className="recipe-list">
      <h2 className="text-2xl font-bold mb-4">Recettes</h2>

      <div className="filter-container mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            className={`filter-button ${filters.vegetarian ? "active" : ""}`}
            onClick={() => toggleFilter("vegetarian")}
          >
            Végétarien
          </button>
          <button className={`filter-button ${filters.vegan ? "active" : ""}`} onClick={() => toggleFilter("vegan")}>
            Vegan
          </button>
          <button
            className={`filter-button ${filters.glutenFree ? "active" : ""}`}
            onClick={() => toggleFilter("glutenFree")}
          >
            Sans Gluten
          </button>
        </div>
      </div>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card bg-white rounded-lg shadow-md overflow-hidden">
              <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{recipe.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{recipe.time}</span>
                  <span>{recipe.servings} portions</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {recipe.tags?.map((tag) => (
                    <span key={tag} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          Aucune recette trouvée. Essayez de modifier vos filtres ou d'importer des recettes.
        </div>
      )}
    </div>
  )
}

export default RecipeList
