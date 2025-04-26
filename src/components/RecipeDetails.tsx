import React, { useState, useEffect } from "react"
import Parse from "../lib/parseInt"
import { Heart, Clock, Users } from "lucide-react"
import "../styles/RecipeDetails.css"
import { authService } from "../services/authService"

interface Recipe {
  id?: string;
  title: string;
  description: string;
  time: string;
  servings: number;
  image: string;
  ingredients: string[];
  steps: string[];
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
}

interface RecipeDetailsProps {
  recipeId?: string;
}

// Fonction pour retirer les balises HTML
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]+>/g, "");
};

const RecipeDetails = ({ recipeId }: RecipeDetailsProps) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger la recette et vérifier si elle est dans les favoris
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
        // Si pas d'ID, utiliser une recette par défaut pour la démo
        setRecipe({
          title: "Pâtes Carbonara",
          description: "Une recette italienne classique, crémeuse et savoureuse.",
          time: "15 minutes",
          servings: 4,
          image:
            "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
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
            "Pendant ce temps, faire revenir la pancetta dans une poêle jusqu'à ce qu'elle soit croustillante.",
            "Dans un bol, mélanger les œufs, le parmesan, du sel et du poivre.",
            "Égoutter les pâtes en réservant un peu d'eau de cuisson.",
            "Mélanger rapidement les pâtes avec la pancetta et le mélange d'œufs.",
            "Ajouter un peu d'eau de cuisson si nécessaire pour obtenir une sauce crémeuse.",
            "Servir immédiatement avec du parmesan supplémentaire et du poivre noir fraîchement moulu.",
          ],
        });
        setLoading(false);
        return;
      }

      try {
        console.log("Récupération de la recette avec l'ID:", recipeId);
        const recipeData = await Parse.Cloud.run("getRecipeById", { recipeId });
        console.log("Recette récupérée:", recipeData);

        if (recipeData) {
          const cleanedDescription = stripHtml(recipeData.description);
          setRecipe({
            ...recipeData,
            description: cleanedDescription,
          });

          if (await authService.isAuthenticated()) {
            const isFavorite = await authService.isRecipeFavorite(recipeId);
            console.log("Est dans les favoris:", isFavorite);
            setFavorite(isFavorite);
          }
        } else {
          setError("Recette non trouvée");
        }
      } catch (err: any) { // Explicitly type err as any
        console.error("Erreur lors du chargement de la recette:", err);
        setError(err.message || "Erreur lors du chargement de la recette");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  // Gérer l'ajout/retrait des favoris
  const toggleFavorite = async () => {
    console.log("toggleFavorite called");
    if (!recipe?.id) {
      console.error("Recipe ID is undefined or null:", recipe);
      alert("Erreur : ID de la recette non défini.");
      return;
    }

    try {
      const isAuthenticated = await authService.isAuthenticated();
      console.log("Utilisateur authentifié:", isAuthenticated);
      if (isAuthenticated) {
        console.log("Current favorite state:", favorite);
        if (favorite) {
          console.log("Removing from favorites, recipe ID:", recipe.id);
          await authService.removeFromFavorites(recipe.id);
          setFavorite(false);
          alert("Recette retirée des favoris !");
        } else {
          console.log("Adding to favorites, recipe ID:", recipe.id);
          await authService.addToFavorites(recipe.id);
          setFavorite(true);
          alert("Recette ajoutée aux favoris !");
        }
      } else {
        console.log("Utilisateur non authentifié, affichage de l'alerte.");
        alert("Veuillez vous connecter pour ajouter des favoris");
      }
    } catch (error: any) { // Explicitly type error as any
      console.error("Erreur lors de la gestion des favoris:", error);
      alert("Une erreur s'est produite lors de la gestion des favoris : " + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Chargement de la recette...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!recipe) {
    return <div className="not-found">Recette non trouvée</div>;
  }

  return (
    <div className="recipe-details">
      <div className="recipe-hero" style={{ backgroundImage: `url(${recipe.image})` }}></div>

      <div className="recipe-content">
        <h1 className="recipe-details-title">{recipe.title}</h1>
        <p className="recipe-description">{recipe.description}</p>

        <div className="recipe-meta">
          <div className="recipe-meta-item">
            <Clock size={20} className="recipe-meta-icon" />
            <span>{recipe.time}</span>
          </div>
          <div className="recipe-meta-item">
            <Users size={20} className="recipe-meta-icon" />
            <span>{recipe.servings} personnes</span>
          </div>
        </div>

        {(recipe.vegetarian || recipe.vegan || recipe.glutenFree || recipe.dairyFree) && (
          <div className="recipe-preferences">
            {recipe.vegetarian && <span className="recipe-preference vegetarian">Végétarien</span>}
            {recipe.vegan && <span className="recipe-preference vegan">Vegan</span>}
            {recipe.glutenFree && <span className="recipe-preference gluten-free">Sans Gluten</span>}
            {recipe.dairyFree && <span className="recipe-preference dairy-free">Sans Lactose</span>}
          </div>
        )}

        <button onClick={toggleFavorite} className={`favorite-button ${favorite ? "active" : ""}`}>
          <Heart size={20} className={`favorite-icon ${favorite ? "fill-current" : ""}`} />
          {favorite ? "Ajouté aux favoris" : "Ajouter aux favoris"}
        </button>

        <div className="recipe-details-content">
          <div className="recipe-section">
            <h2 className="recipe-section-title">Ingrédients</h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  <input type="checkbox" id={`ingredient-${index}`} className="ingredient-checkbox" />
                  <label htmlFor={`ingredient-${index}`} className="ingredient-label">
                    {ingredient}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="recipe-section">
            <h2 className="recipe-section-title">Étapes de préparation</h2>
            <ol className="steps-list">
              {recipe.steps.map((step, index) => (
                <li key={index} className="step-item">
                  <div
                    className={`step-content ${expandedStep === index ? "expanded" : ""}`}
                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  >
                    <span className="step-number">{index + 1}.</span>
                    <span className="step-text">{step}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;