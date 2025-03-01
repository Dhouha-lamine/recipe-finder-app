import React from "react";
import { useState } from "react";
import { LogOut } from "lucide-react";

interface AccountSettingsProps {
  onLogout: () => void;
}

const AccountSettings = ({ onLogout }: AccountSettingsProps) => {
  const [user, setUser] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
  });

  const [preferences, setPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    nutAllergy: false,
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile updated:", user);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password changed");
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.checked,
    });
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-content">
          <h1 className="account-title">Paramètres du Compte</h1>

          {/* Profile Edit Section */}
          <section className="account-section">
            <h2 className="account-section-title">Édition du Profil</h2>
            <form onSubmit={handleProfileSubmit} className="auth-form">
              <div className="flex items-center space-x-4">
                <img src={user.avatar} alt="Avatar" className="avatar-image" />
                <button className="primary-button">Changer l'avatar</button>
              </div>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <button type="submit" className="primary-button">
                Sauvegarder le Profil
              </button>
            </form>
          </section>

          {/* Password Change Section */}
          <section className="account-section">
            <h2 className="account-section-title">Modification du Mot de Passe</h2>
            <form onSubmit={handlePasswordSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Mot de passe actuel
                </label>
                <input type="password" id="currentPassword" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  Nouveau mot de passe
                </label>
                <input type="password" id="newPassword" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmer le nouveau mot de passe
                </label>
                <input type="password" id="confirmPassword" className="form-input" />
              </div>
              <button type="submit" className="primary-button">
                Changer le Mot de Passe
              </button>
            </form>
          </section>

          {/* Dietary Preferences Section */}
          <section className="account-section">
            <h2 className="account-section-title">Préférences Alimentaires</h2>
            <div className="preferences-list">
              {Object.entries(preferences).map(([key, value]) => (
                <label key={key} className="preference-item">
                  <input
                    type="checkbox"
                    name={key}
                    checked={value}
                    onChange={handlePreferenceChange}
                    className="preference-checkbox"
                  />
                  <span className="preference-label">
                    {key === "vegetarian" && "Végétarien"}
                    {key === "vegan" && "Vegan"}
                    {key === "glutenFree" && "Sans Gluten"}
                    {key === "lactoseFree" && "Sans Lactose"}
                    {key === "nutAllergy" && "Allergie aux Noix"}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Logout Button */}
          <section>
            <button onClick={onLogout} className="logout-button">
              <LogOut className="mr-2" size={20} />
              Se Déconnecter
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;