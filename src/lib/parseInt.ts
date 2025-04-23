import Parse from 'parse';

// Initialisation de Parse avec vos identifiants
Parse.initialize(
  process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID || "XUV2cAyhaIren1YS2oxQH7g1Af63JZGLfSFMFm1V",
  process.env.NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY || "ZzvR2GkDzKgDyKwqaJruSJcztkM0oyRUwBHQ3iXt"
);

// Configuration de l'URL du serveur
Parse.serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL || "https://parseapi.back4app.com";

export default Parse;
