import React from "react";
import { useState } from "react"
import { recipeService } from "../services/recipeService"

const RecipeImporter = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [jsonFilePath, setJsonFilePath] = useState("./recipes.json")
  const [error, setError] = useState<string | null>(null)

  const handleSpoonacularSearch = async () => {
    if (!searchTerm) {
      setError("Veuillez entrer un terme de recherche")
      return
    }

    setIsImporting(true)
    setError(null)
    setImportResult(null)

    try {
      const recipes = await recipeService.searchAndSaveSpoonacularRecipes(searchTerm, 10)
      setImportResult(`${recipes.length} recettes importées avec succès depuis Spoonacular`)
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'importation des recettes")
    } finally {
      setIsImporting(false)
    }
  }

  const handleJsonImport = async () => {
    if (!jsonFilePath) {
      setError("Veuillez spécifier le chemin du fichier JSON")
      return
    }

    setIsImporting(true)
    setError(null)
    setImportResult(null)

    try {
      const count = await recipeService.importRecipesFromJsonFile(jsonFilePath)
      setImportResult(`${count} recettes importées avec succès depuis le fichier JSON`)
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'importation des recettes")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="recipe-importer">
      <h2 className="text-2xl font-bold mb-4">Importation de Recettes</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {importResult && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{importResult}</div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Importer depuis Spoonacular</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Terme de recherche (ex: pasta, chicken...)"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSpoonacularSearch}
            disabled={isImporting}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isImporting ? "Importation..." : "Importer"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Importer depuis un fichier JSON</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={jsonFilePath}
            onChange={(e) => setJsonFilePath(e.target.value)}
            placeholder="Chemin du fichier JSON"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleJsonImport}
            disabled={isImporting}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isImporting ? "Importation..." : "Importer"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecipeImporter
