import React, { useEffect, useState } from "react"
import { Heart, Clock, Users, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react"
import "../styles/RecipeDetails.css"
import { fetchRecipeDetails } from "../services/recipeService"

interface RecipeDetailsProps {
  recipeId?: number
  onBackClick?: () => void
}

interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  instructions: string
  extendedIngredients: {
    id: number
    original: string
  }[] 
  analyzedInstructions: {
    name: string
    steps: {
      number: number
      step: string
    }[] 
  }[] 
  source?: string
}

interface DefaultRecipe {
  title: string
  description: string
  time: string
  servings: number
  image: string
  ingredients: string[]
  steps: string[]
  readyInMinutes?: number
}

const RecipeDetails = ({ recipeId, onBackClick }: RecipeDetailsProps) => {
  const [favorite, setFavorite] = useState(false)
  const [recipe, setRecipe] = useState<SpoonacularRecipe | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<number[]>([])

  useEffect(() => {
    if (recipeId) {
      const savedFavorites = localStorage.getItem("favoriteRecipes")
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites)
        setFavorite(favorites.includes(recipeId))
      }
    }
  }, [recipeId])

  useEffect(() => {
    const getRecipeDetails = async () => {
      if (!recipeId) return
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchRecipeDetails(recipeId)
        setRecipe(data)
        if (data?.source) setDataSource(data.source as "api" | "local")
      } catch (err) {
        setError("Impossible de charger les détails de la recette. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }

    getRecipeDetails()
  }, [recipeId])

  const toggleFavorite = () => {
    if (!recipeId) return
    const savedFavorites = localStorage.getItem("favoriteRecipes")
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : []
    if (favorite) {
      favorites = favorites.filter((id: number) => id !== recipeId)
    } else {
      favorites.push(recipeId)
    }
    localStorage.setItem("favoriteRecipes", JSON.stringify(favorites))
    setFavorite(!favorite)
  }

  const toggleStepDetails = (stepNumber: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((step) => step !== stepNumber) : [...prev, stepNumber]
    )
  }

  const defaultRecipe: DefaultRecipe = {
    title: "Pâtes Carbonara",
    description: "Une recette italienne classique, crémeuse et savoureuse.",
    time: "15 minutes",
    servings: 4,
    readyInMinutes: 15,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    ingredients: [
      "400g de spaghetti",
      "200g de pancetta ou de lardons",
      "4 œufs",
      "100g de parmesan râpé",
      "2 gousses d'ail",
      "Sel et poivre noir",
    ],
    steps: [
      "Faire bouillir une grande casserole d'eau salée et y cuire les pâtes al dente.",
      "Faire revenir la pancetta dans une poêle jusqu'à ce qu'elle soit croustillante.",
      "Dans un bol, mélanger les œufs, le parmesan, du sel et du poivre.",
      "Égoutter les pâtes en réservant un peu d'eau de cuisson.",
      "Mélanger rapidement les pâtes avec la pancetta et le mélange d'œufs.",
      "Ajouter un peu d'eau de cuisson si nécessaire pour une sauce crémeuse.",
      "Servir immédiatement avec du parmesan et du poivre noir.",
    ],
  }

  const displayRecipe = recipe || defaultRecipe
  const ingredients = recipe ? recipe.extendedIngredients.map((ing) => ing.original) : defaultRecipe.ingredients

  const steps = recipe
    ? recipe.analyzedInstructions.length > 0
      ? recipe.analyzedInstructions[0].steps.map((step) => step.step)
      : recipe.instructions
        ? [recipe.instructions]
        : defaultRecipe.steps
    : defaultRecipe.steps

  if (isLoading) {
    return (
      <div className="recipe-details">
        <div className="recipe-details-container">
          <p>Chargement de la recette...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="recipe-details">
        <div className="recipe-details-container">
          <div className="error-message">{error}</div>
          {onBackClick && (
            <button onClick={onBackClick} className="back-button">
              <ChevronLeft size={20} /> Retour
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="recipe-details">
      <div
        className="recipe-hero"
        style={{
          backgroundImage: `url(${displayRecipe.image || "https://via.placeholder.com/800x400"})`,
        }}
      ></div>

      <div className="recipe-details-container">
        {onBackClick && (
          <button onClick={onBackClick} className="back-button">
            <ChevronLeft size={20} /> Retour
          </button>
        )}

        {dataSource && (
          <p style={{ fontSize: "0.85rem", color: "gray", textAlign: "center", marginBottom: "1rem" }}>
            Source : {dataSource === "api" ? "API Spoonacular" : "Recette locale"}
          </p>
        )}

        <h1 className="recipe-details-title">{displayRecipe.title}</h1>

        <div className="recipe-details-meta">
          <span><Clock size={16} style={{ marginRight: 5 }} /> {recipe ? `${recipe.readyInMinutes} min` : defaultRecipe.time}</span>
          <span style={{ marginLeft: "1rem" }}><Users size={16} style={{ marginRight: 5 }} /> {displayRecipe.servings} pers.</span>
        </div>

        <button onClick={toggleFavorite} className={`favorite-button ${favorite ? "active" : ""}`}>
          <Heart size={18} />
          {favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        </button>

        <section className="recipe-summary">
          <h2 className="recipe-section-title">À propos</h2>
          <div dangerouslySetInnerHTML={{ __html: recipe?.summary || defaultRecipe.description }} />
        </section>

        <section className="recipe-ingredients">
          <h2 className="recipe-section-title">Ingrédients</h2>
          <ul className="ingredients-list">
            {ingredients.map((ing, idx) => (
              <li key={idx} className="ingredient-item">
                <input type="checkbox" className="ingredient-checkbox" /> {ing}
              </li>
            ))}
          </ul>
        </section>

        <section className="recipe-instructions">
          <h2 className="recipe-section-title">Instructions</h2>
          <ol className="steps-list">
            {steps.map((step, idx) => (
              <li key={idx} className="step-item">
                <span className="step-number">{idx + 1}.</span>
                <span className="step-text">
                  {step.length > 100 ? step.slice(0, 100) + "..." : step}
                </span>
                <div
                  className="step-toggle"
                  onClick={() => toggleStepDetails(idx)}
                >
                  {expandedSteps.includes(idx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                <div className={`step-details ${expandedSteps.includes(idx) ? "expanded" : "collapsed"}`}>
                  {step}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

export default RecipeDetails
