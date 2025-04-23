import React from 'react';
import ReactDOM from 'react-dom/client';  // Import from 'react-dom/client'
import './index.css'; // Optional, if you have a CSS file
import App from './App'; // Assuming you have an App.tsx component

// Initialiser Parse avant de rendre l'application
import "./lib/parseInt"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

