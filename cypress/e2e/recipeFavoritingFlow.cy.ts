// === GROUPE DE TEST : Ajout / Suppression d’une recette dans les favoris ===

describe("Recipe Favoriting Flow", () => {
    // Avant chaque test dans ce bloc
    beforeEach(() => {
      // --- ÉTAPE 1 : Simulation de l'API Spoonacular ---
      // On utilise une commande personnalisée pour "mock" les données de recettes
      // Cela permet d’avoir toujours les mêmes données lors des tests
      cy.mockSpoonacular();
  
      // --- ÉTAPE 2 : Connexion d’un utilisateur test ---
      // On visite la page de connexion
      cy.visit("/login");
  
      // On remplit les champs "username" et "password"
      cy.get('input[name="username"]').type("testuser");         // identifiant
      cy.get('input[name="password"]').type("password123");      // mot de passe
  
      // On clique sur le bouton "Se connecter"
      cy.get('button[type="submit"]').click();
  
      // --- ÉTAPE 3 : Accès à la page de détails d’une recette spécifique ---
      cy.visit("/recipe/639747");
    });
  
    // === TEST : Ajouter puis retirer une recette des favoris ===
    it("allows a user to favorite and unfavorite a recipe", () => {
      // --- PHASE 1 : AJOUT AUX FAVORIS ---
  
      // On clique sur le bouton "Ajouter aux favoris"
      cy.contains("Ajouter aux favoris").click();
  
      // Vérifie que le bouton est bien remplacé par "Ajouté aux favoris"
      cy.contains("Ajouté aux favoris").should("be.visible");
  
      // Vérifie que l’alerte s’affiche bien
      cy.contains("Recette ajoutée aux favoris !").should("be.visible");
  
      // --- PHASE 2 : VERIFICATION DANS LA PAGE DE FAVORIS ---
  
      // On va à la page des favoris
      cy.visit("/favorites");
  
      // Vérifie que la recette y apparaît
      cy.contains("Red Lentil Soup with Chicken and Turnips").should("be.visible");
  
      // --- PHASE 3 : RETRAIT DES FAVORIS ---
  
      // On retourne à la page de la recette
      cy.visit("/recipe/639747");
  
      // On clique sur "Ajouté aux favoris" pour la retirer
      cy.contains("Ajouté aux favoris").click();
  
      // Vérifie que le bouton revient à "Ajouter aux favoris"
      cy.contains("Ajouter aux favoris").should("be.visible");
  
      // Vérifie que le message de succès apparaît
      cy.contains("Recette retirée des favoris !").should("be.visible");
  
      // --- PHASE 4 : VERIFICATION FINALE DANS LA PAGE DE FAVORIS ---
  
      // On revisite la page des favoris
      cy.visit("/favorites");
  
      // Vérifie que la recette n’y est plus
      cy.contains("Red Lentil Soup with Chicken and Turnips").should("not.exist");
    });
  });
  