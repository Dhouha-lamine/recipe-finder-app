import Parse from "../lib/parseInt"
import type { Recipe } from "../types/recipe"
import { spoonacularService } from "./spoonacularService"
import { jsonImportService } from "./jsonImportService"

// Convertir un objet Parse en objet Recipe
const parseObjectToRecipe = (parseObject: Parse.Object): Recipe => {
  return {
    id: parseObject.id,
    objectId: parseObject.id,
    title: parseObject.get("title"),
    description: parseObject.get("description"),
    time: parseObject.get("time"),
    servings: parseObject.get("servings"),
    image: parseObject.get("image"),
    ingredients: parseObject.get("ingredients"),
    steps: parseObject.get("steps"),
    tags: parseObject.get("tags") || [],
  }
}

export const recipeService = {
  // Récupérer toutes les recettes depuis Parse
  async getAllRecipes(): Promise<Recipe[]> {
    const Recipe = Parse.Object.extend("Recipe")
    const query = new Parse.Query(Recipe)
    const results = await query.find()
    return results.map(parseObjectToRecipe)
  },

  // Récupérer une recette par ID depuis Parse
  async getRecipeById(id: string): Promise<Recipe | null> {
    const Recipe = Parse.Object.extend("Recipe")
    const query = new Parse.Query(Recipe)
    try {
      const result = await query.get(id)
      return parseObjectToRecipe(result)
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette:", error)
      return null
    }
  },

  // Rechercher des recettes par titre dans Parse
  async searchRecipes(searchTerm: string): Promise<Recipe[]> {
    const Recipe = Parse.Object.extend("Recipe")
    const query = new Parse.Query(Recipe)
    query.contains("title", searchTerm)
    const results = await query.find()
    return results.map(parseObjectToRecipe)
  },

  // Filtrer les recettes par tags dans Parse
  async filterRecipes(filters: { [key: string]: boolean }): Promise<Recipe[]> {
    const Recipe = Parse.Object.extend("Recipe")
    const query = new Parse.Query(Recipe)

    // Créer un tableau des filtres actifs
    const activeTags = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key]) => key)

    if (activeTags.length > 0) {
      query.containedIn("tags", activeTags)
    }

    const results = await query.find()
    return results.map(parseObjectToRecipe)
  },

  // Rechercher des recettes via Spoonacular et les sauvegarder dans Parse
  async searchAndSaveSpoonacularRecipes(searchTerm: string, number = 10): Promise<Recipe[]> {
    try {
      // Rechercher des recettes via Spoonacular
      const spoonacularRecipes = await spoonacularService.searchRecipes(searchTerm, number)

      // Sauvegarder les recettes dans Parse
      const Recipe = Parse.Object.extend("Recipe")
      const savedRecipes: Recipe[] = []

      for (const recipe of spoonacularRecipes) {
        // Vérifier si la recette existe déjà
        const query = new Parse.Query(Recipe)
        query.equalTo("title", recipe.title)
        const existingRecipe = await query.first()

        if (!existingRecipe) {
          const newRecipe = new Recipe()

          newRecipe.set("title", recipe.title)
          newRecipe.set("description", recipe.description)
          newRecipe.set("time", recipe.time)
          newRecipe.set("servings", recipe.servings)
          newRecipe.set("image", recipe.image)
          newRecipe.set("ingredients", recipe.ingredients)
          newRecipe.set("steps", recipe.steps)
          newRecipe.set("tags", recipe.tags)

          const savedRecipe = await newRecipe.save()
          savedRecipes.push(parseObjectToRecipe(savedRecipe))
        } else {
          savedRecipes.push(parseObjectToRecipe(existingRecipe))
        }
      }

      return savedRecipes
    } catch (error) {
      console.error("Erreur lors de la recherche et sauvegarde des recettes:", error)
      throw error
    }
  },

  // Importer des recettes depuis un fichier JSON et les sauvegarder dans Parse
  async importRecipesFromJsonFile(filePath: string): Promise<number> {
    try {
      const jsonData = await jsonImportService.loadJsonFile(filePath)
      return await jsonImportService.importRecipesFromJson(jsonData)
    } catch (error) {
      console.error("Erreur lors de l'importation des recettes depuis le fichier JSON:", error)
      throw error
    }
  },
}
