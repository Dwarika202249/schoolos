import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ThemeProvider } from './providers/ThemeProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="schoolos-theme">
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'rounded-xl shadow-xl border border-slate-100 font-medium text-sm',
            duration: 4000,
            style: {
              padding: '16px',
            },
          }}
        />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
