import { useState } from "react";
import { Heart, Clock, Users } from "lucide-react";

const RecipeDetails = () => {
  const [favorite, setFavorite] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const recipe = {
    title: "Pâtes Carbonara",
    description: "Une recette italienne classique, crémeuse et savoureuse.",
    time: "15 minutes",
    servings: 4,
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
      "Pendant ce temps, faire revenir la pancetta dans une poêle jusqu'à ce qu'elle soit croustillante.",
      "Dans un bol, mélanger les œufs, le parmesan, du sel et du poivre.",
      "Égoutter les pâtes en réservant un peu d'eau de cuisson.",
      "Mélanger rapidement les pâtes avec la pancetta et le mélange d'œufs.",
      "Ajouter un peu d'eau de cuisson si nécessaire pour obtenir une sauce crémeuse.",
      "Servir immédiatement avec du parmesan supplémentaire et du poivre noir fraîchement moulu.",
    ],
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Image with parallax effect */}
      <div className="h-96 bg-fixed bg-cover bg-center" style={{ backgroundImage: `url(${recipe.image})` }}></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">{recipe.title}</h1>
        <p className="text-gray-600 mb-4">{recipe.description}</p>

        <div className="flex items-center text-gray-600 mb-6">
          <Clock size={20} className="mr-2" />
          <span className="mr-4">{recipe.time}</span>
          <Users size={20} className="mr-2" />
          <span>{recipe.servings} personnes</span>
        </div>

        <button
          onClick={() => setFavorite(!favorite)}
          className={`mb-8 px-6 py-3 rounded-full text-white font-medium transition-all duration-300 ${
            favorite ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          <Heart size={20} className={`inline-block mr-2 ${favorite ? "fill-current" : ""}`} />
          {favorite ? "Ajouté aux favoris" : "Ajouter aux favoris"}
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Ingrédients</h2>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`ingredient-${index}`}
                    className="mr-2 form-checkbox text-orange-500 h-5 w-5"
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
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Étapes de préparation</h2>
            <ol>
              {recipe.steps.map((step, index) => (
                <li key={index} className="mb-4">
                  <button
                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                    className="w-full text-left"
                  >
                    <span className="font-semibold text-orange-500 mr-2">{index + 1}.</span>
                    <span className="text-gray-700">{expandedStep === index ? step : `${step.slice(0, 50)}...`}</span>
                  </button>
                  <div
                    className={`mt-2 pl-6 text-gray-600 transition-all duration-300 ${
                      expandedStep === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {step}
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