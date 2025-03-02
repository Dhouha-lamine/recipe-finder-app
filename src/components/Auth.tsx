import  React from "react"

import { useState } from "react"
import { Chrome, Facebook } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import "./auth.css"

interface AuthProps {
  mode: "login" | "register"
  onLogin: () => void
}

const Auth = ({ mode: initialMode, onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      // Simuler une connexion réussie
      onLogin()
    } else {
      // Simuler une inscription réussie
      setIsLogin(true)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{isLogin ? "Connexion" : "Inscription"} - Recipe Finder</h1>
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
            <div className="terms-container">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <label htmlFor="terms" className="terms-label">
                J'accepte les conditions d'utilisation
              </label>
            </div>
          )}
          <Button type="submit" className="auth-button">
            {isLogin ? "Se connecter" : "S'inscrire"}
          </Button>
        </form>
        {isLogin && (
          <div className="forgot-password">
            <button className="link-button">Mot de passe oublié ?</button>
          </div>
        )}
        <div className="toggle-mode">
          <button onClick={() => setIsLogin(!isLogin)} className="link-button">
            {isLogin ? "Pas encore inscrit ? Créer un compte" : "Déjà inscrit ? Connexion ici"}
          </button>
        </div>
        <div className="social-login">
          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">Ou continuer avec</div>
          </div>
          <div className="social-buttons">
            <Button variant="outline" className="social-button">
              <Chrome className="icon" /> Google
            </Button>
            <Button variant="outline" className="social-button">
              <Facebook className="icon" /> Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth

