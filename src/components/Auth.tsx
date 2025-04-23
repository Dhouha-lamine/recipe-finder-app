import  React from "react"
import Parse from "../lib/parseInt"
import { useState } from "react"
import { Chrome, Facebook } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import "../styles/Auth.css"


interface AuthProps {
  mode: "login" | "register"
  onLogin: () => void
}

const Auth = ({ mode: initialMode, onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login")
  const [formData, setFormData] = useState({
    username: "", 
    name: "",
    email: "",
    password: "",
    terms: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!isLogin && !formData.username.trim()) {
      setError("Le nom d'utilisateur est obligatoire");
      return;
    }
  
    setError(null);
    setLoading(true);
  
    try {
      if (isLogin) {
        // Connexion avec email
        await Parse.User.logIn(formData.email, formData.password);
        onLogin();
      } else {
        // Inscription
        const user = new Parse.User();
        user.set("username", formData.username.trim()); // Utilisez le vrai username
        user.set("email", formData.email);
        user.set("password", formData.password);
        user.set("name", formData.name); // Nom complet séparé
  
        if (!formData.terms) {
          setError("Vous devez accepter les conditions");
          setLoading(false);
          return;
        }
  
        await user.signUp();
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Veuillez entrer votre email pour réinitialiser votre mot de passe")
      return
    }

    setLoading(true)
    try {
      await Parse.User.requestPasswordReset(formData.email)
      alert("Un email de réinitialisation a été envoyé à votre adresse email")
    } catch (error: any) {
      console.error("Erreur de réinitialisation:", error)
      setError(error.message || "Erreur lors de la réinitialisation du mot de passe")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{isLogin ? "Connexion" : "Inscription"} - Recipe Finder</h1>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
  {!isLogin && (
    <>
      <Input
        type="text"
        placeholder="Nom d'utilisateur"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
        className="auth-input"
        required
      />
    </>
  )}
  
  <Input
    type="email"
    placeholder="Email"
    value={formData.email}
    onChange={(e) => setFormData({...formData, email: e.target.value})}
    className="auth-input"
    required
  />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="auth-input"
            required
            disabled={loading}
          />
          {!isLogin && (
            <div className="terms-container">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, terms: checked })}
                disabled={loading}
              />
              <label htmlFor="terms" className="terms-label">
                J'accepte les conditions d'utilisation
              </label>
            </div>
          )}
          <Button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
          </Button>
        </form>
        {isLogin && (
          <div className="forgot-password">
            <button className="link-button" onClick={handleForgotPassword} disabled={loading} type="button">
              Mot de passe oublié ?
            </button>
          </div>
        )}
        <div className="toggle-mode">
          <button onClick={() => setIsLogin(!isLogin)} className="link-button" disabled={loading} type="button">
            {isLogin ? "Pas encore inscrit ? Créer un compte" : "Déjà inscrit ? Connexion ici"}
          </button>
        </div>
        <div className="social-login">
          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">Ou continuer avec</div>
          </div>
          <div className="social-buttons">
            <Button variant="outline" className="social-button" disabled={loading} type="button">
              <Chrome className="icon" /> Google
            </Button>
            <Button variant="outline" className="social-button" disabled={loading} type="button">
              <Facebook className="icon" /> Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
