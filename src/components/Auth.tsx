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
    <div className="min-h-screen bg-orange-50 flex items-center justify-center pt-16">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md m-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">
          {isLogin ? "Connexion" : "Inscription"} - Recipe Finder
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <Input
              type="text"
              placeholder="Nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full"
          />
          {!isLogin && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                J'accepte les conditions d'utilisation
              </label>
            </div>
          )}
          <Button type="submit" className="w-full">
            {isLogin ? "Se connecter" : "S'inscrire"}
          </Button>
        </form>
        {isLogin && (
          <div className="text-center mt-4">
            <button className="text-sm text-orange-600 hover:underline">
              Mot de passe oublié ?
            </button>
          </div>
        )}
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-orange-600 hover:underline">
            {isLogin ? "Pas encore inscrit ? Créer un compte" : "Déjà inscrit ? Connexion ici"}
          </button>
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-orange-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              <Chrome className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="w-full">
              <Facebook className="mr-2 h-4 w-4" /> Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;