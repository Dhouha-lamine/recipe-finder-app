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

  // Récupérer d'abord toutes les recettes locales filtrées
  const localData = await getLocalRecipes(query, filters)

  // Calculer le nombre total de pages pour les recettes locales
  const localTotalPages = Math.ceil(localData.totalResults / resultsPerPage)

  // Si la page demandée est supérieure à 1, vérifier si elle correspond à une page de recettes locales
  if (page > 1) {
    // La page 2 correspond à la première page des recettes locales
    const localPageIndex = page - 2

    if (localPageIndex >= 0 && localPageIndex < localTotalPages) {
      // Cette page contient des recettes locales
      const startIndex = localPageIndex * resultsPerPage
      const endIndex = startIndex + resultsPerPage

      const paginatedLocalRecipes = localData.results.slice(startIndex, endIndex)

      const result = {
        results: paginatedLocalRecipes,
        totalResults: localData.totalResults + resultsPerPage, // Ajouter le nombre de recettes API (page 1)
        source: "local",
        currentPage: page,
      }

      // Sauvegarder dans le cache
      saveToCache(cacheKey, result)

      return result
    }
  }

  // Si nous sommes sur la page 1 ou si la page demandée ne correspond pas à une page de recettes locales,
  // récupérer les recettes de l'API
  const API_KEY = "b89c88a166b3499db06e06a3e96c9957"
  const URL = "https://api.spoonacular.com/recipes/complexSearch"

  try {
    // Construire l'URL avec les filtres
    let apiUrl = `${URL}?query=${query}&apiKey=${API_KEY}&number=${resultsPerPage}`

    if (filters.vegetarian) apiUrl += "&diet=vegetarian"
    if (filters.vegan) apiUrl += "&diet=vegan"
    if (filters.glutenFree) apiUrl += "&intolerances=gluten"

    const response = await fetch(apiUrl)

    // Vérifier si l'API a atteint sa limite
    if (!response.ok) {
      if (hasReachedApiLimit(response)) {
        console.log("API limit reached, using local data for first page")
        // Si l'API a atteint sa limite, utiliser les premières recettes locales pour la page 1
        const firstPageLocalRecipes = localData.results.slice(0, resultsPerPage)

        const result = {
          results: firstPageLocalRecipes,
          totalResults: localData.totalResults,
          source: "local",
          currentPage: page,
        }

        // Sauvegarder dans le cache
        saveToCache(cacheKey, result)

        return result
      }
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()

    // Calculer le nombre total de résultats (API + local)
    const totalResults = data.totalResults + localData.totalResults

    const result = {
      ...data,
      totalResults: totalResults,
      source: "api",
      currentPage: page,
    }

    // Sauvegarder dans le cache
    saveToCache(cacheKey, result)

    return result
  } catch (error) {
    console.error("Erreur lors de la récupération des recettes:", error)
    // En cas d'erreur, utiliser les données locales pour la première page
    const firstPageLocalRecipes = localData.results.slice(0, resultsPerPage)

    const result = {
      results: firstPageLocalRecipes,
      totalResults: localData.totalResults,
      source: "local",
      currentPage: page,
    }

    // Sauvegarder dans le cache
    saveToCache(cacheKey, result)

    return result
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

  // Vérifier d'abord si la recette existe dans les données locales
  const localRecipe = typedLocalRecipes.find((r) => r.id === recipeId)
  if (localRecipe) {
    const result = {
      ...localRecipe,
      source: "local",
    }

    // Sauvegarder dans le cache
    saveToCache(cacheKey, result)

    return result
  }

  // Si la recette n'est pas trouvée localement, essayer l'API
  const API_KEY = "b89c88a166b3499db06e06a3e96c9957"

  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`)

    // Vérifier si l'API a atteint sa limite
    if (!response.ok) {
      if (hasReachedApiLimit(response)) {
        console.log("API limit reached, but recipe not found locally")
        return null
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
    return null
  }
}

// Fonction pour filtrer les recettes locales
const getLocalRecipes = async (
  query: string,
  filters: { vegetarian: boolean; vegan: boolean; glutenFree: boolean },
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

  return {
    results: filteredRecipes,
    totalResults: filteredRecipes.length,
  }
}
