import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import MainProviders from './providers/main-providers.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainProviders>
      <App />
    </MainProviders>
  </StrictMode>
);
