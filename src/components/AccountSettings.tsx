import React from "react";
import { useState ,useEffect } from "react";
import { LogOut, Check, AlertCircle , Trash2,User } from "lucide-react";
import "../styles/AccountSettings.css";
import Parse from "../lib/parseInt"

interface AccountSettingsProps {
  onLogout: () => void
}

// Interface pour les préférences utilisateur
interface UserPreferences {
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  lactoseFree: boolean
  nutAllergy: boolean
}

const AccountSettings = ({ onLogout }: AccountSettingsProps) => {
  const [currentUser, setCurrentUser] = useState<Parse.User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // État du profil utilisateur
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // État pour les préférences alimentaires
  const [preferences, setPreferences] = useState<UserPreferences>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    nutAllergy: false,
  })

  // Référence à l'objet UserPreference
  const [userPreferenceObj, setUserPreferenceObj] = useState<Parse.Object | null>(null)

  // Charger les données de l'utilisateur au montage
  useEffect(() => {
    const fetchUserData = async () => {
      const parseUser = Parse.User.current()
      if (parseUser) {
        setCurrentUser(parseUser as unknown as Parse.User)

        // Récupérer les données de l'utilisateur
        setUsername(parseUser.get("username") || "")
        setEmail(parseUser.get("email") || "")
        const userAvatar = parseUser.get("avatar");
        setAvatar(userAvatar ? userAvatar.url() : "");

        // Récupérer les préférences alimentaires
        try {
          const UserPreference = Parse.Object.extend("UserPreference")
          const query = new Parse.Query(UserPreference)
          query.equalTo("user", parseUser)
          const userPreference = await query.first()

          if (userPreference) {
            setUserPreferenceObj(userPreference as unknown as Parse.Object)
            setPreferences({
              vegetarian: userPreference.get("vegetarian") || false,
              vegan: userPreference.get("vegan") || false,
              glutenFree: userPreference.get("glutenFree") || false,
              lactoseFree: userPreference.get("lactoseFree") || false,
              nutAllergy: userPreference.get("nutAllergy") || false,
            })
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des préférences:", error)
        }
      }
      setLoading(false)
    }

    fetchUserData()
  }, [])

  // Mettre à jour le profil
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentUser) return

    try {
      // Mettre à jour le nom d'utilisateur et l'email
      if (username !== currentUser.get("username")) {
        currentUser.set("username", username)
      }
      if (email !== currentUser.get("email")) {
        currentUser.set("email", email)
      }

      // Mettre à jour le mot de passe si fourni
      if (newPassword) {
        currentUser.set("password", newPassword)
      }

      await currentUser.save()
      setNewPassword("") // Réinitialiser le champ mot de passe
      setSuccess("Profil mis à jour avec succès!")
    } catch (error: any) {
      setError(error.message || "Erreur lors de la mise à jour du profil")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;

    const file = e.target.files[0];
    if (!file.type.includes('image')) {
        setError('Veuillez sélectionner une image valide');
        return;
    }

    try {
        const parseFile = new Parse.File(file.name, file);
        await parseFile.save();
        
        currentUser.set('avatar', parseFile);
        await currentUser.save();
        
        const avatarUrl = parseFile.url();
        if (!avatarUrl) {
            throw new Error("Impossible de récupérer l'URL de l'avatar");
        }
        
        setAvatar(avatarUrl);
        setSuccess('Avatar mis à jour avec succès!');
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        setError(error instanceof Error ? error.message : 'Erreur lors du téléchargement de l\'avatar');
    }
};

  // Mettre à jour les préférences alimentaires
  const handlePreferenceChange = async (key: keyof UserPreferences, checked: boolean) => {
    setPreferences({
        ...preferences,
        [key]: checked,
    });

    if (!currentUser) return;

    try {
        const UserPreference = Parse.Object.extend("UserPreference");
        
        // Solution 1: Utilisation d'une variable intermédiaire avec type garanti
        let preferenceToUpdate: Parse.Object;
        
        if (userPreferenceObj) {
            preferenceToUpdate = userPreferenceObj;
        } else {
            preferenceToUpdate = new UserPreference();
            preferenceToUpdate.set("user", currentUser);
            await preferenceToUpdate.save();
            setUserPreferenceObj(preferenceToUpdate);
        }

        // Maintenant TypeScript est certain que preferenceToUpdate existe
        preferenceToUpdate.set(key, checked);
        await preferenceToUpdate.save();

    } catch (error) {
        console.error("Erreur lors de la mise à jour des préférences:", error);
        setError("Erreur lors de la mise à jour des préférences");
    }
};

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    if (!currentUser) return

    // Demander confirmation
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")

    if (!confirmed) return

    try {
      // Supprimer les préférences utilisateur
      if (userPreferenceObj) {
        await userPreferenceObj.destroy()
      }

      // Supprimer les favoris de l'utilisateur
      const Favorite = Parse.Object.extend("Favorite")
      const query = new Parse.Query(Favorite)
      query.equalTo("user", currentUser)
      const favorites = await query.find()

      if (favorites.length > 0) {
        await Parse.Object.destroyAll(favorites)
      }

      // Supprimer le compte utilisateur
      await currentUser.destroy()

      // Déconnecter l'utilisateur
      await Parse.User.logOut()
      onLogout()
    } catch (error: any) {
      setError(error.message || "Erreur lors de la suppression du compte")
    }
  }

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await Parse.User.logOut()
      onLogout()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="account-content">
            <p>Chargement des informations du compte...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="account-content">
            <h1 className="account-title">Paramètres du Compte</h1>
            <p>Veuillez vous connecter pour accéder aux paramètres de votre compte.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-content">
          <h1 className="account-title">Paramètres du Compte</h1>

          {/* Messages de succès et d'erreur */}
          {success && (
            <div className="success-message">
              <Check size={20} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Edit Section */}
          <section className="account-section">
            <h2 className="account-section-title">Édition du Profil</h2>
            <form onSubmit={handleUpdate} className="auth-form">
            <div className="flex items-center space-x-4">
    {avatar ? (
        <img src={avatar} alt="Avatar" className="avatar-image" />
    ) : (
        <div className="avatar-placeholder">
            <User size={48} className="text-gray-400" />
        </div>
    )}
    <label className="primary-button cursor-pointer">
        <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
        />
        {avatar ? 'Changer l\'avatar' : 'Ajouter un avatar'}
    </label>
    {avatar && (
        <button 
            onClick={async () => {
                setAvatar("");
                if (currentUser) {
                    currentUser.unset('avatar');
                    await currentUser.save();
                }
            }}
            className="secondary-button"
        >
            Supprimer
        </button>
    )}
</div>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  Nouveau mot de passe (facultatif)
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Laissez vide pour ne pas modifier"
                />
              </div>
              <button type="submit" className="primary-button">
                Mettre à jour le Profil
              </button>
            </form>
          </section>

          {/* Dietary Preferences Section */}
          <section className="account-section">
            <h2 className="account-section-title">Préférences Alimentaires</h2>
            <div className="preferences-list">
              <label className="preference-item">
                <input
                  type="checkbox"
                  checked={preferences.vegetarian}
                  onChange={(e) => handlePreferenceChange("vegetarian", e.target.checked)}
                  className="preference-checkbox"
                />
                <span className="preference-label">Végétarien</span>
              </label>
              <label className="preference-item">
                <input
                  type="checkbox"
                  checked={preferences.vegan}
                  onChange={(e) => handlePreferenceChange("vegan", e.target.checked)}
                  className="preference-checkbox"
                />
                <span className="preference-label">Vegan</span>
              </label>
              <label className="preference-item">
                <input
                  type="checkbox"
                  checked={preferences.glutenFree}
                  onChange={(e) => handlePreferenceChange("glutenFree", e.target.checked)}
                  className="preference-checkbox"
                />
                <span className="preference-label">Sans Gluten</span>
              </label>
              <label className="preference-item">
                <input
                  type="checkbox"
                  checked={preferences.lactoseFree}
                  onChange={(e) => handlePreferenceChange("lactoseFree", e.target.checked)}
                  className="preference-checkbox"
                />
                <span className="preference-label">Sans Lactose</span>
              </label>
              <label className="preference-item">
                <input
                  type="checkbox"
                  checked={preferences.nutAllergy}
                  onChange={(e) => handlePreferenceChange("nutAllergy", e.target.checked)}
                  className="preference-checkbox"
                />
                <span className="preference-label">Allergie aux Noix</span>
              </label>
            </div>
          </section>

          {/* Account Actions Section */}
          <section className="account-section">
            <h2 className="account-section-title">Actions du Compte</h2>
            <div className="account-actions">
              <button onClick={handleLogout} className="logout-button">
                <LogOut className="mr-2" size={20} />
                Se Déconnecter
              </button>
              <button onClick={handleDeleteAccount} className="delete-button">
                <Trash2 className="mr-2" size={20} />
                Supprimer le Compte
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AccountSettings
