import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './utils/i18n';
import { initTelegramApp } from './utils/telegram';
import App from './App.jsx';

// Initialize Telegram Web App
initTelegramApp();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
