import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Font Plus Jakarta Sans disimpan di proyek sendiri (tidak mengambil dari Google Fonts).
import '@fontsource-variable/plus-jakarta-sans';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
