// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Giữ lại dòng này để import CSS chung
import App from './App'; // Import component App

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);