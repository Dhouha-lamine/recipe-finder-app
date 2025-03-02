import React from 'react';
import { useState } from "react";
import { Search, BookmarkPlus, Zap, Star, Facebook, Twitter, Instagram, User } from "lucide-react";
import RecipeSearch from "./components/RecipeSearch";
import RecipeDetails from "./components/RecipeDetails";
import Favorites from "./components/Favorites";
import Auth from "./components/Auth";
import AccountSettings from "./components/AccountSettings";

function App() {
  
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'details' | 'favorites' | 'auth' | 'account'>('home');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const goToHome = () => setCurrentView('home');
  const goToSearch = () => setCurrentView('search');
  const goToDetails = () => setCurrentView('details');
  const goToFavorites = () => setCurrentView('favorites');
  const goToAccount = () => setCurrentView('account');
  const goToAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setCurrentView('auth');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    goToHome();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    goToHome();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="site-header">
        <div className="header-container">
          <div 
            className="site-logo" 
            onClick={goToHome}
          >
            Ready2Cook
          </div>
          <nav className="nav-menu">
            <button 
              onClick={goToHome} 
              className="nav-link"
            >
              Accueil
            </button>
            <button 
              onClick={goToFavorites}
              className="nav-link"
            >
              Favoris
            </button>
            {isLoggedIn ? (
              <>
                <button
                  onClick={goToAccount}
                  className="nav-link"
                >
                  <User className="inline-block mr-1" size={18} />
                  Mon Compte
                </button>
                <button
                  onClick={handleLogout}
                  className="nav-link"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button 
                onClick={() => goToAuth('login')}
                className="nav-link"
              >
                Connexion
              </button>
            )}
          </nav>
          <button 
            className="primary-button"
            onClick={goToSearch}
          >
            Trouver une recette
          </button>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'search' && <RecipeSearch onRecipeClick={goToDetails} />}
      {currentView === 'details' && <RecipeDetails />}
      {currentView === 'favorites' && <Favorites onRecipeClick={goToDetails} />}
      {currentView === 'auth' && <Auth mode={authMode} onLogin={handleLogin} />}
      {currentView === 'account' && <AccountSettings onLogout={handleLogout} />}
      {currentView === 'home' && (
        <>
          {/* Hero Section */}
          <section className="hero-section" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1 className="hero-title">
                Trouvez des recettes avec les ingrédients que vous avez déjà !
              </h1>
              <div className="search-bar">
                <input type="text" placeholder="Entrez vos ingrédients..." className="search-input" />
                <button 
                  className="search-button"
                  onClick={goToSearch}
                >
                  Rechercher
                </button>
              </div>
              <button 
                className="secondary-button"
                onClick={goToSearch}
              >
                Explorer les recettes populaires 👀
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="container">
              <h2 className="section-title">Nos Fonctionnalités</h2>
              <div className="features-container">
                <div className="feature-card">
                  <Search className="feature-icon" size={48} />
                  <h3 className="feature-title">Recherche intelligente</h3>
                  <p className="feature-description">Trouvez des recettes instantanément en entrant quelques ingrédients.</p>
                </div>
                <div className="feature-card">
                  <BookmarkPlus className="feature-icon" size={48} />
                  <h3 className="feature-title">Sauvegarde de recettes</h3>
                  <p className="feature-description">Ajoutez vos plats préférés à une liste pour plus tard.</p>
                </div>
                <div className="feature-card">
                  <Zap className="feature-icon" size={48} />
                  <h3 className="feature-title">Interface rapide et fluide</h3>
                  <p className="feature-description">Une expérience utilisateur sans effort.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="testimonials-section">
            <div className="container">
              <h2 className="section-title">Ce que disent nos utilisateurs</h2>
              <div className="testimonials-container">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="testimonial-card">
                    <div className="testimonial-header">
                      <img
                        src={`https://i.pravatar.cc/50?img=${i}`}
                        alt={`User ${i}`}
                        className="testimonial-avatar"
                      />
                      <div className="testimonial-info">
                        <div className="testimonial-name">Utilisateur {i}</div>
                        <div className="testimonial-stars">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="text-yellow-400" size={16} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="testimonial-text">"J'adore cette appli ! Elle m'aide à cuisiner sans gaspillage."</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="cta-section">
            <div className="container">
              <h2 className="cta-title">Prêt à découvrir de nouvelles recettes ?</h2>
              <button 
                className="primary-button"
                onClick={goToSearch}
              >
                Essayez maintenant
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="site-footer">
            <div className="footer-container">
              <div className="footer-logo">Recipe Finder</div>
              <div className="footer-links">
                <a href="#" className="footer-link">À propos</a>
                <a href="#" className="footer-link">Mentions légales</a>
                <a href="#" className="footer-link">Contact</a>
              </div>
              <div className="footer-social">
                <a href="#" className="social-link">
                  <Facebook size={24} />
                </a>
                <a href="#" className="social-link">
                  <Twitter size={24} />
                </a>
                <a href="#" className="social-link">
                  <Instagram size={24} />
                </a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;