import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

const AllTheProviders = ({ children, user, cart }) => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options = {}) => {
  const { user, cart, ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <AllTheProviders user={user} cart={cart}>
      {children}
    </AllTheProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

export * from '@testing-library/react';
export { customRender as render };
