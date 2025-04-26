import "@testing-library/jest-dom";
import Parse from "parse/node";

// Ensure Parse is initialized for tests
Parse.initialize("testAppId", "testJavascriptKey");
Parse.serverURL = "http://localhost:1337/parse";

// Mock Parse globally for all tests
jest.mock("parse/node", () => {
  const actualParse = jest.requireActual("parse/node");
  return {
    ...actualParse,
    User: {
      current: jest.fn(() => ({ id: "user1", username: "testuser" })),
      logIn: jest.fn((username, password) => {
        if (username === "testuser" && password === "password") {
          return Promise.resolve({ id: "user1", username: "testuser" });
        } else {
          return Promise.reject(new Error("Invalid username/password"));
        }
      }),
      logOut: jest.fn(() => Promise.resolve()),
    },
    Query: jest.fn(() => ({
      equalTo: jest.fn().mockReturnThis(),
      first: jest.fn(() => Promise.resolve({ id: "fav1" })),
    })),
    Object: {
      extend: jest.fn((className) => {
        return class {
          set = jest.fn().mockReturnThis();
          save = jest.fn(() => Promise.resolve());
          destroy = jest.fn(() => Promise.resolve());
        };
      }),
    },
  };
});

process.env.REACT_APP_PARSE_SERVER_URL = "https://example.com/parse";
process.env.REACT_APP_PARSE_APPLICATION_ID = "exampleAppId";
process.env.REACT_APP_PARSE_JAVASCRIPT_KEY = "exampleJsKey";

// Suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Erreur lors du chargement de la recette')) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Suppress all console.log calls during tests
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Récupération de la recette") ||
      args[0].includes("Recette récupérée") ||
      args[0].includes("Est dans les favoris") ||
      args[0].includes("toggleFavorite called") ||
      args[0].includes("Utilisateur authentifié") ||
      args[0].includes("Current favorite state") ||
      args[0].includes("Adding to favorites") ||
      args[0].includes("Removing from favorites"))
  ) {
    return;
  }
  originalConsoleLog(...args);
};

// Suppress the Parse SDK warning about using the browser version in Node.js
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("It looks like you're using the browser version of the SDK in a node.js environment")
  ) {
    return;
  }
  originalConsoleWarn(...args);
};