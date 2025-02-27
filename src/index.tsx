import React from 'react';
import ReactDOM from 'react-dom/client';  // Import from 'react-dom/client'
import './index.css'; // Optional, if you have a CSS file
import App from './App'; // Assuming you have an App.tsx component

// Create a root and render the App component to the 'root' div in index.html
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement  // Ensure root is of type HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

