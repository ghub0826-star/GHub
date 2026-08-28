import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import AppErrorBoundary from './components/common/AppErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <SocketProvider>
                <App />
              </SocketProvider>
            </CartProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </Router>
    </HelmetProvider>
  </React.StrictMode>
);
