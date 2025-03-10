import React from 'react';
import { useState } from "react";
import { Search, Clock, Heart } from "lucide-react";
import "../styles/recipesearch.css";
interface RecipeSearchProps {
  onRecipeClick: () => void;
}

const RecipeSearch = ({ onRecipeClick }: RecipeSearchProps) => {
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
  });

  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((recipeId) => recipeId !== id)
        : [...prev, id]
    );
  };

  const recipes = [
    {
      id: 1,
      title: "Pasta Primavera",
      time: "30 min",
      image:
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
    {
      id: 2,
      title: "Chicken Stir Fry",
      time: "25 min",
      image:
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
    {
      id: 3,
      title: "Vegetable Soup",
      time: "45 min",
      image:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
    {
      id: 4,
      title: "Beef Tacos",
      time: "20 min",
      image:
        "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
    {
      id: 5,
      title: "Mushroom Risotto",
      time: "40 min",
      image:
        "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
    {
      id: 6,
      title: "Grilled Salmon",
      time: "15 min",
      image:
        "https://images.unsplash.com/photo-1485921325833-c519f76c4927?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
    {
      id: 7,
      title: "Vegetarian Pizza",
      time: "35 min",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
    {
      id: 8,
      title: "Chocolate Cake",
      time: "50 min",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    },
  ];

  return (
    <div className="search-page">
      <h1 className="search-page-title">Recherche de Recettes</h1>

      {/* Barre de recherche */}
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Entrez un ingrédient..."
            className="search-box-input"
          />
          <button className="search-box-button">
            <Search size={24} />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-container">
        {Object.entries(filters).map(([key, value]) => (
          <button
            key={key}
            onClick={() => toggleFilter(key as keyof typeof filters)}
            className={`filter-button ${value ? "active" : ""}`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
        <button className="filter-button">Temps de cuisson ▼</button>
      </div>

      {/* Grille de recettes */}
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.title} className="recipe-image" />
            <button
              className={`recipe-favorite ${
                favorites.includes(recipe.id) ? "active" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(recipe.id);
              }}
            >
              <Heart size={20} />
            </button>
            <div className="recipe-content">
              <p className="recipe-title">{recipe.title}</p>
              <div className="recipe-time">
                <Clock size={16} />
                <span>{recipe.time}</span>
              </div>
              <button className="recipe-button" onClick={onRecipeClick}>
                Voir la recette
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-button">Précédent</button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`pagination-button ${page === 1 ? "active" : ""}`}
          >
            {page}
          </button>
        ))}
        <button className="pagination-button">Suivant</button>
      </div>
    </div>
  );
};

export default RecipeSearch;