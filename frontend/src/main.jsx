import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store';
import { ThemeProvider } from './context/ThemeContext';
import { register as registerSW } from './pwa/registerSW';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// Register service worker for PWA
registerSW({
  onSuccess: () => console.log('Service worker registered successfully'),
  onUpdate: () => console.log('New content available, please refresh'),
});
