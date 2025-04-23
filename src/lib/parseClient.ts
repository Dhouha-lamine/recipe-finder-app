import Parse from "parse"

// Initialisation de Parse avec vos identifiants
Parse.initialize(process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID!, process.env.NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY!)

// Configuration de l'URL du serveur
Parse.serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL!

export default Parse
