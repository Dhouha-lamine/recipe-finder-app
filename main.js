import Parse from "./parseConfig";
// Fonction pour nettoyer le HTML des descriptions
function stripHtml(html) {
    // Si la valeur n'est pas une chaîne, retourner une chaîne vide
    if (typeof html !== "string") return ""
  
    // Remplacer les balises HTML courantes par leur équivalent en texte
    return html
      .replace(/<b>/g, "")
      .replace(/<\/b>/g, "")
      .replace(/<i>/g, "")
      .replace(/<\/i>/g, "")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/g, "$2 ($1)")
      .replace(/<[^>]*>/g, "") // Supprimer toutes les autres balises HTML
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, "\n") // Supprimer les lignes vides multiples
      .trim()
  }
  
  // Assuming Parse is available globally or imported elsewhere.
  // If not, you'll need to import it:
  // import Parse from 'parse';
  
  // Or, if you're in a Node.js environment:
  // const Parse = require('parse/node');
  
  // Fonction Cloud Code pour récupérer les recettes depuis Spoonacular
  Parse.Cloud.define("fetchRecipes", async (request) => {
    const query = request.params.query || ""
    const API_KEY = "b89c88a166b3499db06e06a3e96c9957" // Votre clé API Spoonacular
    const BASE_URL = "https://api.spoonacular.com"
  
    console.log(`Recherche Spoonacular pour: "${query}"`)
  
    try {
      // Construire l'URL de l'API Spoonacular
      const url = `${BASE_URL}/recipes/complexSearch?apiKey=${API_KEY}&query=${encodeURIComponent(query)}&number=10&addRecipeInformation=true&instructionsRequired=true&fillIngredients=true`
  
      console.log("URL de requête:", url)
  
      // Utiliser fetch au lieu de Parse.Cloud.httpRequest
      const response = await fetch(url)
  
      if (!response.ok) {
        throw new Error(`Erreur API Spoonacular: ${response.status}`)
      }
  
      const data = await response.json()
  
      if (!data.results || !Array.isArray(data.results)) {
        console.error("Format de réponse inattendu:", data)
        throw new Error("Format de réponse inattendu de l'API Spoonacular")
      }
  
      // Convertir les recettes au format attendu par le frontend
      const recipes = data.results.map((recipe) => ({
        id: recipe.id.toString(),
        title: recipe.title,
        description: stripHtml(recipe.summary), // Nettoyer le HTML
        time: `${recipe.readyInMinutes} minutes`,
        servings: recipe.servings,
        image: recipe.image,
        ingredients: recipe.extendedIngredients.map((ing) => ing.original),
        steps: recipe.analyzedInstructions[0]?.steps.map((step) => step.step) || [],
        vegetarian: recipe.vegetarian || false,
        vegan: recipe.vegan || false,
        glutenFree: recipe.glutenFree || false,
        dairyFree: recipe.dairyFree || false,
      }))
  
      console.log(`${recipes.length} recettes trouvées et converties`)
  
      return recipes
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes:", error)
      throw new Error(`Erreur lors de la récupération des recettes: ${error.message}`)
    }
  })
  
  // Fonction pour récupérer les détails d'une recette par ID
  Parse.Cloud.define("getRecipeById", async (request) => {
    const recipeId = request.params.recipeId
    const API_KEY = "b89c88a166b3499db06e06a3e96c9957" // Votre clé API Spoonacular
    const BASE_URL = "https://api.spoonacular.com"
  
    console.log(`Récupération de la recette avec l'ID: ${recipeId}`)
  
    try {
      // Construire l'URL de l'API Spoonacular
      const url = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=false`
  
      // Utiliser fetch au lieu de Parse.Cloud.httpRequest
      const response = await fetch(url)
  
      if (!response.ok) {
        throw new Error(`Erreur API Spoonacular: ${response.status}`)
      }
  
      const recipe = await response.json()
  
      // Convertir la recette au format attendu par le frontend
      const formattedRecipe = {
        id: recipe.id.toString(),
        title: recipe.title,
        description: stripHtml(recipe.summary), // Nettoyer le HTML
        time: `${recipe.readyInMinutes} minutes`,
        servings: recipe.servings,
        image: recipe.image,
        ingredients: recipe.extendedIngredients.map((ing) => ing.original),
        steps: recipe.analyzedInstructions[0]?.steps.map((step) => step.step) || [],
        vegetarian: recipe.vegetarian || false,
        vegan: recipe.vegan || false,
        glutenFree: recipe.glutenFree || false,
        dairyFree: recipe.dairyFree || false,
      }
  
      return formattedRecipe
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette:", error)
      throw new Error(`Erreur lors de la récupération de la recette: ${error.message}`)
    }
  })
  