import React from 'react';
import { useState } from "react";
import { Chrome, Facebook } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

interface AuthProps {
  mode: 'login' | 'register';
  onLogin: () => void;
}

const Auth = ({ mode: initialMode, onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    terms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Simuler une connexion réussie
      onLogin();
    } else {
      // Simuler une inscription réussie
      setIsLogin(true);
    }
  };

return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {isLogin ? "Connexion" : "Inscription"} - Recipe Finder
        </h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <Input
              type="text"
              placeholder="Nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="auth-input"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="auth-input"
          />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="auth-input"
          />
          {!isLogin && (
            <div className="auth-checkbox-container">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <label htmlFor="terms" className="auth-checkbox-label">
                J'accepte les conditions d'utilisation
              </label>
            </div>
          )}
          <Button type="submit" className="auth-button">
            {isLogin ? "Se connecter" : "S'inscrire"}
          </Button>
        </form>
        {isLogin && (
          <div className="text-center mt-4">
            <button className="auth-link">
              Mot de passe oublié ?
            </button>
          </div>
        )}
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="auth-link">
            {isLogin ? "Pas encore inscrit ? Créer un compte" : "Déjà inscrit ? Connexion ici"}
          </button>
        </div>
        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">Ou continuer avec</span>
        </div>
        <div className="auth-social-buttons">
          <Button variant="outline" className="auth-social-button">
            <Chrome className="mr-2 h-4 w-4" /> Google
          </Button>
          <Button variant="outline" className="auth-social-button">
            <Facebook className="mr-2 h-4 w-4" /> Facebook
          </Button>
        </div>
      </div>
    </div>
);
};
export default Auth;