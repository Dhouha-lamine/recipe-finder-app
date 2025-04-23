import type { Recipe } from "../types/recipe"
import Parse from "../lib/parseInt"

// Interface pour les recettes du fichier JSON
interface JsonRecipe {
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

// Convertir une recette JSON en format de notre application
const convertJsonRecipe = (jsonRecipe: JsonRecipe): Recipe => {
  return {
    title: jsonRecipe.title,
    description: jsonRecipe.summary,
    time: `${jsonRecipe.readyInMinutes} minutes`,
    servings: jsonRecipe.servings,
    image: jsonRecipe.image,
    ingredients: jsonRecipe.extendedIngredients.map((ing) => ing.original),
    steps: jsonRecipe.analyzedInstructions[0]?.steps.map((step) => step.step) || [],
    tags: [
      ...(jsonRecipe.vegetarian ? ["vegetarian"] : []),
      ...(jsonRecipe.vegan ? ["vegan"] : []),
      ...(jsonRecipe.glutenFree ? ["glutenFree"] : []),
    ],
  }
}

export const jsonImportService = {
  // Importer des recettes depuis un fichier JSON
  async importRecipesFromJson(jsonData: JsonRecipe[]): Promise<number> {
    try {
      const Recipe = Parse.Object.extend("Recipe")
      let importedCount = 0

      // Traiter les recettes par lots pour éviter de surcharger Parse
      const batchSize = 20
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize)
        const parseObjects = batch.map((jsonRecipe) => {
          const recipe = new Recipe()
          const convertedRecipe = convertJsonRecipe(jsonRecipe)

          recipe.set("title", convertedRecipe.title)
          recipe.set("description", convertedRecipe.description)
          recipe.set("time", convertedRecipe.time)
          recipe.set("servings", convertedRecipe.servings)
          recipe.set("image", convertedRecipe.image)
          recipe.set("ingredients", convertedRecipe.ingredients)
          recipe.set("steps", convertedRecipe.steps)
          recipe.set("tags", convertedRecipe.tags)
          recipe.set("isVegetarian", jsonRecipe.vegetarian)
          recipe.set("isVegan", jsonRecipe.vegan)
          recipe.set("isGlutenFree", jsonRecipe.glutenFree)
          recipe.set("externalId", jsonRecipe.id.toString())

          return recipe
        })

        await Parse.Object.saveAll(parseObjects)
        importedCount += parseObjects.length
        console.log(`Importé ${importedCount} recettes sur ${jsonData.length}`)
      }

      return importedCount
    } catch (error) {
      console.error("Erreur lors de l'importation des recettes:", error)
      throw error
    }
  },

  // Charger le fichier JSON local
  async loadJsonFile(filePath: string): Promise<JsonRecipe[]> {
    try {
      const response = await fetch(filePath)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Erreur lors du chargement du fichier JSON:", error)
      throw error
    }
  },
}
