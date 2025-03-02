import React from 'react';
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
    <div className="min-h-screen bg-orange-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-8">Paramètres du Compte</h1>

          {/* Profile Edit Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Édition du Profil</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full" />
                <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300">
                  Changer l'avatar
                </button>
              </div>
              <div>
                <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition duration-300"
              >
                Sauvegarder le Profil
              </button>
            </form>
          </section>

          {/* Password Change Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modification du Mot de Passe</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-gray-700 font-bold mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-gray-700 font-bold mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition duration-300"
              >
                Changer le Mot de Passe
              </button>
            </form>
          </section>

          {/* Dietary Preferences Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Préférences Alimentaires</h2>
            <div className="space-y-2">
              {Object.entries(preferences).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    name={key}
                    checked={value}
                    onChange={handlePreferenceChange}
                    className="form-checkbox h-5 w-5 text-orange-600"
                  />
                  <span className="ml-2 text-gray-700">
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
            <button
              onClick={onLogout}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition duration-300 flex items-center justify-center"
            >
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