import React, { useEffect } from 'react';
import { useState } from "react"; 
import { Search, Clock, Heart,Info } from "lucide-react"; 
import "../styles/recipesearch.css"

// Importez le service de recettes
import { fetchRecipes } from "../services/recipeService"

// Types pour l'API Spoonacular
interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  readyInMinutes?: number
  servings?: number
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
}

interface RecipeSearchProps {
  onRecipeClick: (recipeId: number) => void
  initialQuery?: string
  onQueryChange?: (query: string) => void
}

const RecipeSearch = ({ onRecipeClick, initialQuery = "", onQueryChange }: RecipeSearchProps) => {
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
  })

  const [favorites, setFavorites] = useState<number[]>([])
  const [recipes, setRecipes] = useState<SpoonacularRecipe[]>([])
  const [query, setQuery] = useState(initialQuery || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [dataSource, setDataSource] = useState<"api" | "local">("api")
  const resultsPerPage = 8

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery)
      setCurrentPage(1)
    }
  }, [initialQuery, query])

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    if (onQueryChange) {
      onQueryChange(newQuery)
    }
  }

  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }))
    setCurrentPage(1) // Réinitialiser à la première page lors du changement de filtre
  }

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((recipeId) => recipeId !== id) : [...prev, id]))

    // Optionnel: Sauvegarder les favoris dans localStorage
    const updatedFavorites = favorites.includes(id)
      ? favorites.filter((recipeId) => recipeId !== id)
      : [...favorites, id]
    localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites))
  }

  // Charger les favoris depuis localStorage au démarrage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteRecipes")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Fonction pour récupérer les recettes
  const fetchRecipesData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchRecipes(query, filters, currentPage, resultsPerPage)
      setRecipes(data.results)
      setTotalResults(data.totalResults)

      // Déterminer la source des données
      if (data.source) {
        setDataSource(data.source)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des recettes:", err)
      setError("Impossible de charger les recettes. Veuillez réessayer plus tard.")
    } finally {
      setIsLoading(false)
    }
  }

  // Effectuer la recherche lorsque la requête ou les filtres changent
  useEffect(() => {
    fetchRecipesData()
  }, [query, filters, currentPage])

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalResults / resultsPerPage)

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo(0, 0) // Remonter en haut de la page
  }

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  // Gérer la soumission du formulaire de recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Réinitialiser à la première page lors d'une nouvelle recherche
    fetchRecipesData()
  }

  // Déterminer le message de source de données
  const getSourceMessage = () => {
    if (currentPage === 1) {
      return "Recettes de l'API Spoonacular"
    } else {
      return "Recettes de votre collection personnelle"
    }
  }

  return (
    <div className="search-page">
      <h1 className="search-page-title">Recherche de Recettes</h1>

      {/* Barre de recherche */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-box">
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            type="text"
            placeholder="Entrez un ingrédient ou un plat..."
            className="search-box-input"
          />
          <button type="submit" className="search-box-button">
            <Search size={24} />
          </button>
        </form>
      </div>

      {/* Filtres */}
      <div className="filter-container">
        {Object.entries(filters).map(([key, value]) => (
          <button
            key={key}
            onClick={() => toggleFilter(key as keyof typeof filters)}
            className={`filter-button ${value ? "active" : ""}`}
          >
            {key === "vegetarian"
              ? "Végétarien"
              : key === "vegan"
                ? "Végan"
                : key === "glutenFree"
                  ? "Sans Gluten"
                  : key}
          </button>
        ))}
      </div>

      {/* Indicateur de source des données */}
      <div className="data-source-indicator">
        <Info size={16} className="mr-1" />
        <span>
          Page {currentPage}: {getSourceMessage()}
        </span>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des recettes...</p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && <div className="error-message">{error}</div>}

      {/* Grille de recettes */}
      {!isLoading && !error && (
        <>
          {recipes.length === 0 ? (
            <div className="no-results">
              <p>Aucune recette trouvée. Essayez d'autres termes de recherche ou filtres.</p>
            </div>
          ) : (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card" onClick={() => onRecipeClick(recipe.id)}>
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    className="recipe-image"
                    onError={(e) => {
                      // Image de remplacement si l'image ne charge pas
                      ;(e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Recette"
                    }}
                  />
                  <button
                    className={`recipe-favorite ${favorites.includes(recipe.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(recipe.id)
                    }}
                  >
                    <Heart size={20} />
                  </button>
                  <div className="recipe-content">
                    <p className="recipe-title">{recipe.title}</p>
                    <div className="recipe-time">
                      <Clock size={16} />
                      <span>{recipe.readyInMinutes || "30"} min</span>
                    </div>
                    <button
                      className="recipe-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRecipeClick(recipe.id)
                      }}
                    >
                      Voir la recette
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {recipes.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  className={`pagination-button ${page === currentPage ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RecipeSearch
