// Importez le type Recipe
import type { Recipe } from "../types/recipe"
import localRecipes from "../data/recipes.json"

// Ajoutez un type pour le fichier JSON importé
const typedLocalRecipes = localRecipes as Recipe[]

// Fonction pour vérifier si l'API a atteint sa limite
const hasReachedApiLimit = (response: Response): boolean => {
  return (
    response.status === 402 ||
    response.status === 429 ||
    response.statusText.includes("limit") ||
    response.statusText.includes("exceeded")
  )
}

// Fonctions de cache
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 heures en millisecondes

// Fonction pour sauvegarder dans le cache
const saveToCache = (key: string, data: any) => {
  const cacheItem = {
    data,
    timestamp: Date.now(),
  }
  localStorage.setItem(key, JSON.stringify(cacheItem))
}

// Fonction pour récupérer du cache
const getFromCache = (key: string) => {
  const cachedItem = localStorage.getItem(key)
  if (!cachedItem) return null

  const { data, timestamp } = JSON.parse(cachedItem)
  const isExpired = Date.now() - timestamp > CACHE_DURATION

  if (isExpired) {
    localStorage.removeItem(key)
    return null
  }

  return data
}

// Fonction pour récupérer la liste des recettes
export const fetchRecipes = async (
  query: string,
  filters: { vegetarian: boolean; vegan: boolean; glutenFree: boolean },
  page: number,
  resultsPerPage: number,
) => {
  // Créer une clé de cache unique basée sur les paramètres
  const cacheKey = `recipes_${query}_${JSON.stringify(filters)}_${page}_${resultsPerPage}`

  // Vérifier si les données sont dans le cache
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    console.log("Using cached recipe list data")
    return cachedData
  }

  const API_KEY = "b89c88a166b3499db06e06a3e96c9957"
  const URL = "https://api.spoonacular.com/recipes/complexSearch"

  try {
    // Construire l'URL avec les filtres
    let apiUrl = `${URL}?query=${query}&apiKey=${API_KEY}&number=${resultsPerPage}&offset=${(page - 1) * resultsPerPage}`

    if (filters.vegetarian) apiUrl += "&diet=vegetarian"
    if (filters.vegan) apiUrl += "&diet=vegan"
    if (filters.glutenFree) apiUrl += "&intolerances=gluten"

    const response = await fetch(apiUrl)

    // Vérifier si l'API a atteint sa limite
    if (!response.ok) {
      if (hasReachedApiLimit(response)) {
        console.log("API limit reached, using local data")
        return await getLocalRecipes(query, filters, page, resultsPerPage)
      }
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()
    const result = {
      ...data,
      source: "api",
    }

    // Sauvegarder dans le cache
    saveToCache(cacheKey, result)

    return result
  } catch (error) {
    console.error("Erreur lors de la récupération des recettes:", error)
    // En cas d'erreur, utiliser les données locales
    return await getLocalRecipes(query, filters, page, resultsPerPage)
  }
}

// Fonction pour récupérer les détails d'une recette
export const fetchRecipeDetails = async (recipeId: number) => {
  // Vérifier si les détails sont dans le cache
  const cacheKey = `recipe_details_${recipeId}`
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    console.log("Using cached recipe details data")
    return cachedData
  }

  const API_KEY = "b89c88a166b3499db06e06a3e96c9957"

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`)

    // Vérifier si l'API a atteint sa limite
    if (!response.ok) {
      if (hasReachedApiLimit(response)) {
        console.log("API limit reached, using local data")
        return await getLocalRecipeDetails(recipeId)
      }
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()
    const result = {
      ...data,
      source: "api",
    }

    // Sauvegarder dans le cache
    saveToCache(cacheKey, result)

    return result
  } catch (error) {
    console.error("Erreur lors de la récupération des détails:", error)
    // En cas d'erreur, utiliser les données locales
    return await getLocalRecipeDetails(recipeId)
  }
}

// Fonction pour filtrer les recettes locales (renommée pour éviter l'erreur de hook)
const getLocalRecipes = async (
  query: string,
  filters: { vegetarian: boolean; vegan: boolean; glutenFree: boolean },
  page: number,
  resultsPerPage: number,
) => {
  // Filtrer les recettes locales selon les critères
  const filteredRecipes = typedLocalRecipes.filter((recipe) => {
    // Filtrer par requête
    if (query && !recipe.title.toLowerCase().includes(query.toLowerCase())) {
      return false
    }

    // Appliquer les filtres
    if (filters.vegetarian && !recipe.vegetarian) return false
    if (filters.vegan && !recipe.vegan) return false
    if (filters.glutenFree && !recipe.glutenFree) return false

    return true
  })

  // Calculer la pagination
  const startIndex = (page - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex)

  return {
    results: paginatedRecipes,
    totalResults: filteredRecipes.length,
    source: "local",
  }
}

// Fonction pour récupérer les détails d'une recette locale (renommée pour éviter l'erreur de hook)
const getLocalRecipeDetails = async (recipeId: number) => {
  // Chercher la recette dans les données locales
  const recipe = typedLocalRecipes.find((r) => r.id === recipeId)

  if (recipe) {
    return {
      ...recipe,
      source: "local",
    }
  }

  // Si la recette n'est pas trouvée, retourner un objet vide
  return null
}
