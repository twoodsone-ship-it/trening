import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './fonts.css';
import '@fontsource/roboto-condensed/cyrillic-600.css';
import '@fontsource/roboto-condensed/cyrillic-700.css';
import '@fontsource/roboto-condensed/cyrillic-800.css';
import '@fontsource/roboto-condensed/latin-600.css';
import '@fontsource/roboto-condensed/latin-700.css';
import '@fontsource/roboto-condensed/latin-800.css';
import '@fontsource/jetbrains-mono/cyrillic-500.css';
import '@fontsource/jetbrains-mono/cyrillic-700.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
