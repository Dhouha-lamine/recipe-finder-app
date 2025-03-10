import React from "react";
import { useState } from "react";
import { Heart, Clock, Users } from "lucide-react";
import "../styles/RecipeDetails.css"

const RecipeDetails = () => {
  const [favorite, setFavorite] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const recipe = {
    title: "Pâtes Carbonara",
    description: "Une recette italienne classique, crémeuse et savoureuse.",
    time: "15 minutes",
    servings: 4,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    ingredients: [
      "400g de spaghetti",
      "200g de pancetta ou de lardons",
      "4 œufs",
      "100g de parmesan râpé",
      "2 gousses d'ail",
      "Sel et poivre noir",
    ],
    steps: [
      "Faire bouillir une grande casserole d'eau salée et y cuire les pâtes al dente.",
      "Pendant ce temps, faire revenir la pancetta dans une poêle jusqu'à ce qu'elle soit croustillante.",
      "Dans un bol, mélanger les œufs, le parmesan, du sel et du poivre.",
      "Égoutter les pâtes en réservant un peu d'eau de cuisson.",
      "Mélanger rapidement les pâtes avec la pancetta et le mélange d'œufs.",
      "Ajouter un peu d'eau de cuisson si nécessaire pour obtenir une sauce crémeuse.",
      "Servir immédiatement avec du parmesan supplémentaire et du poivre noir fraîchement moulu.",
    ],
  };

  return (
    <div className="recipe-details">
      {/* Image with parallax effect */}
      <div className="recipe-hero" style={{ backgroundImage:` url(${recipe.image})` }}></div>

      <div className="recipe-content">
        <h1 className="recipe-details-title">{recipe.title}</h1>
        <p className="recipe-description">{recipe.description}</p>

        <div className="flex items-center text-gray-600 mb-6">
          <Clock size={20} className="mr-2" />
          <span className="mr-4">{recipe.time}</span>
          <Users size={20} className="mr-2" />
          <span>{recipe.servings} personnes</span>
        </div>

        <button
          onClick={() => setFavorite(!favorite)}
          className={`favorite-button ${favorite ? "active" : ""}`}
        >
          <Heart size={20} className={`mr-2 ${favorite ? "fill-current" : ""}`} />
          {favorite ? "Ajouté aux favoris" : "Ajouter aux favoris"}
        </button>

        <div className="recipe-details-content">
          {/* Ingredients */}
          <div>
            <h2 className="recipe-section-title">Ingrédients</h2>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  <input
                    type="checkbox"
                    id={`ingredient-${index}`}
                    className="ingredient-checkbox"
                  />
                  <label htmlFor={`ingredient-${index}`} className="text-gray-700">
                    {ingredient}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h2 className="recipe-section-title">Étapes de préparation</h2>
            <ul>
              {recipe.steps.map((step, index) => (
                <li key={index} className="step-item">
                  <button
                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                    className="step-button"
                  >
                    <span className="step-number">{index + 1}.</span>
                    <span className="step-text">{expandedStep === index ? step : `${step.slice(0, 50)}...`}</span>
                  </button>
                  <div
                    className={`step-details ${
                      expandedStep === index ? "expanded" : "collapsed"
                    }`}
                  >
                    {step}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
