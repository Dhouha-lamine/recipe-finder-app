import type { Recipe } from "../types/recipe"

const API_KEY = "b89c88a166b3499db06e06a3e96c9957"
const BASE_URL = "https://api.spoonacular.com"

// Interface pour les recettes de Spoonacular
interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  instructions: string
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  extendedIngredients: Array<{
    id: number
    original: string
  }>
  analyzedInstructions: Array<{
    name: string
    steps: Array<{
      number: number
      step: string
    }>
  }>
}

// Convertir une recette Spoonacular en format de notre application
const convertSpoonacularRecipe = (spoonRecipe: SpoonacularRecipe): Recipe => {
  return {
    title: spoonRecipe.title,
    description: spoonRecipe.summary,
    time: `${spoonRecipe.readyInMinutes} minutes`,
    servings: spoonRecipe.servings,
    image: spoonRecipe.image,
    ingredients: spoonRecipe.extendedIngredients.map((ing) => ing.original),
    steps: spoonRecipe.analyzedInstructions[0]?.steps.map((step) => step.step) || [],
    tags: [
      ...(spoonRecipe.vegetarian ? ["vegetarian"] : []),
      ...(spoonRecipe.vegan ? ["vegan"] : []),
      ...(spoonRecipe.glutenFree ? ["glutenFree"] : []),
    ],
  }
}

export const spoonacularService = {
  // Rechercher des recettes par terme
  async searchRecipes(query: string, number = 10): Promise<Recipe[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&number=${number}&addRecipeInformation=true&instructionsRequired=true&fillIngredients=true`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la recherche de recettes")
      }

      return data.results.map(convertSpoonacularRecipe)
    } catch (error) {
      console.error("Erreur lors de la recherche de recettes:", error)
      throw error
    }
  },

  // Obtenir les détails d'une recette par ID
  async getRecipeById(id: number): Promise<Recipe> {
    try {
      const response = await fetch(`${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=false`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la récupération de la recette")
      }

      return convertSpoonacularRecipe(data)
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette:", error)
      throw error
    }
  },

  // Obtenir des recettes aléatoires
  async getRandomRecipes(number = 10): Promise<Recipe[]> {
    try {
      const response = await fetch(`${BASE_URL}/recipes/random?apiKey=${API_KEY}&number=${number}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la récupération des recettes aléatoires")
      }

      return data.recipes.map(convertSpoonacularRecipe)
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes aléatoires:", error)
      throw error
    }
  },
}
