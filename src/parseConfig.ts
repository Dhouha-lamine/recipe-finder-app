import Parse from "parse/node";

// Vérifier si les variables d'environnement sont définies
console.log('REACT_APP_PARSE_APPLICATION_ID:', process.env.REACT_APP_PARSE_APPLICATION_ID);
console.log('REACT_APP_PARSE_JAVASCRIPT_KEY:', process.env.REACT_APP_PARSE_JAVASCRIPT_KEY);
console.log('REACT_APP_PARSE_SERVER_URL:', process.env.REACT_APP_PARSE_SERVER_URL);

// Vérifier si une variable est undefined et lancer une erreur explicite
if (
  !process.env.REACT_APP_PARSE_APPLICATION_ID ||
  !process.env.REACT_APP_PARSE_JAVASCRIPT_KEY ||
  !process.env.REACT_APP_PARSE_SERVER_URL
) {
  throw new Error('Les identifiants Parse ne sont pas définis dans les variables d\'environnement');
}

// Initialisation de Parse avec les paramètres Back4App
if (!Parse.applicationId) {
  Parse.initialize(
    process.env.REACT_APP_PARSE_APPLICATION_ID!,
    process.env.REACT_APP_PARSE_JAVASCRIPT_KEY!
  );
  Parse.serverURL = process.env.REACT_APP_PARSE_SERVER_URL!;
}

export default Parse;