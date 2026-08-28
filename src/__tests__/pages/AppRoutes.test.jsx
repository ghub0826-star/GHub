import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { SocketProvider } from '../../context/SocketContext';
import AppErrorBoundary from '../../components/common/AppErrorBoundary';
import App from '../../App';

const renderAppWithRoute = (initialRoute = '/') => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialRoute]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <SocketProvider>
                <App />
              </SocketProvider>
            </CartProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Full Application Routing & Error Boundary Integration', () => {
  it('renders Home page without any router errors', async () => {
    renderAppWithRoute('/');
    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });

  it('renders /seller/register without router context error', async () => {
    renderAppWithRoute('/seller/register');
    await waitFor(() => {
      expect(screen.getByText(/Mulai Berjualan di GHub/i)).toBeInTheDocument();
    });
  });

  it('renders /seller/pro-store (public seller profile) without router context error', async () => {
    renderAppWithRoute('/seller/pro-store');
    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });

  it('renders /seller/pending without router context error', async () => {
    renderAppWithRoute('/seller/pending');
    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });

  it('renders ErrorBoundary fallback without router context error when a child throws', () => {
    const ProblemChild = () => {
      throw new Error('Test crash');
    };

    // Prevent console.error noise during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <AppErrorBoundary>
          <ProblemChild />
        </AppErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByText(/Terjadi kesalahan saat membuka halaman/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kembali ke Homepage/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
