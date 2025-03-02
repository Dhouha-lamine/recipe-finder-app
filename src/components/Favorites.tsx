import React from 'react';
import { useState } from "react";
import { Trash2, Share2, Grid, List, Heart } from "lucide-react";

interface FavoritesProps {
  onRecipeClick: (id: number) => void; // Nouvelle prop pour gérer le clic sur une recette
}

const Favorites = ({ onRecipeClick }: FavoritesProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState([
    { id: 1, title: "Pâtes Carbonara", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80", isFavorite: true },
    { id: 2, title: "Salade César", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80", isFavorite: true },
    { id: 3, title: "Poulet Rôti aux Herbes", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80", isFavorite: true },
    { id: 4, title: "Risotto aux Champignons", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80", isFavorite: true },
    { id: 5, title: "Tarte aux Pommes", image: "https://images.unsplash.com/photo-1562007908-17c67e878c88?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80", isFavorite: true },
    { id: 6, title: "Saumon Grillé", image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80", isFavorite: true },
  ]);

  const handleRemoveFavorite = (id: number) => {
    setFavorites(favorites.filter((recipe) => recipe.id !== id));
  };

  const handleShareRecipe = (id: number) => {
    console.log(`Sharing recipe with id: ${id}`);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(
      favorites.map((recipe) =>
        recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      )
    );
  };

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">Mes Recettes Favorites</h1>

      <div className="container">
        {/* View mode toggle */}
        <div className="view-toggle">
          <button
            onClick={() => setViewMode("grid")}
            className={`view-button ${viewMode === "grid" ? "active" : ""}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`view-button ${viewMode === "list" ? "active" : ""}`}
          >
            <List size={20} />
          </button>
        </div>

        {/* Favorites list/grid */}
        <div className={viewMode === "grid" ? "favorites-grid" : "favorites-list"}>
          {favorites.map((recipe) => (
            <div
              key={recipe.id}
              className={`favorite-card ${viewMode === "list" ? "list" : ""}`}
              onClick={() => onRecipeClick(recipe.id)} // Gestionnaire de clic pour la carte
            >
              <img
                src={recipe.image}
                alt={recipe.title}
                className="favorite-image"
              />
              <div className="favorite-content">
                <h3 className="favorite-title">{recipe.title}</h3>
                <div className="favorite-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation de l'événement
                      toggleFavorite(recipe.id);
                    }}
                    className="favorite-heart"
                  >
                    {recipe.isFavorite ? (
                      <Heart size={20} fill="currentColor" className="text-red-500" />
                    ) : (
                      <Heart size={20} className="text-gray-500 hover:text-red-500" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation de l'événement
                      handleRemoveFavorite(recipe.id);
                    }}
                    className="favorite-action delete"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation de l'événement
                      handleShareRecipe(recipe.id);
                    }}
                    className="favorite-action share"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <div className="empty-favorites">
            <p>Vous n'avez pas encore de recettes favorites.</p>
            <p>Explorez nos recettes et ajoutez-en à vos favoris !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;