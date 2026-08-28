import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Auth/Login';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';

vi.mock('../../services/api', () => ({
  default: {
    defaults: { headers: { common: {} } },
  },
}));

vi.mock('../../services/authService');
vi.mock('../../services/sessionService');
vi.mock('../../services/securityService');

vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  };
});

describe('Login page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
    });
  });

  const renderWithRouter = () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login />
      </BrowserRouter>
    );
  };

  describe('rendering', () => {
    it('should render login form', () => {
      renderWithRouter();
      expect(screen.getByText(/Selamat Datang Kembali/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Email atau Username/i)).toBeInTheDocument();
    });

    it('should render password field', () => {
      renderWithRouter();
      const passwordInput = document.querySelector('input[type="password"]');
      expect(passwordInput).toBeInTheDocument();
    });

    it('should render login and reset password buttons', () => {
      renderWithRouter();
      expect(screen.getByText('Masuk')).toBeInTheDocument();
      expect(screen.getByText(/Lupa Password/i)).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderWithRouter();
      expect(screen.getByText(/Belum punya akun/i)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show error when identity is empty', async () => {
      renderWithRouter();
      fireEvent.click(screen.getByText('Masuk'));
      await waitFor(() => {
        expect(screen.getByText('Email atau username wajib diisi')).toBeInTheDocument();
      });
    });

    it('should show error when password is empty', async () => {
      renderWithRouter();
      const identityInput = screen.getByPlaceholderText(/Email atau Username/i);
      fireEvent.change(identityInput, { target: { value: 'buyer.test@ghub.local' } });
      fireEvent.click(screen.getByText('Masuk'));
      await waitFor(() => {
        expect(screen.getByText('Password wajib diisi')).toBeInTheDocument();
      });
    });

    it('should not call login when validation fails', async () => {
      renderWithRouter();
      fireEvent.click(screen.getByText('Masuk'));
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });
  });

  describe('form submission', () => {
    it('should show loading state during submission', async () => {
      mockLogin.mockResolvedValue({ success: true, user: { role: 'BUYER' } });
      renderWithRouter();

      const identityInput = screen.getByPlaceholderText(/Email atau Username/i);
      const passwordInput = document.querySelector('input[type="password"]');
      fireEvent.change(identityInput, { target: { value: 'buyer.test@ghub.local' } });
      fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });

      const submitButton = screen.getByText('Masuk');
      fireEvent.click(submitButton);
      expect(submitButton).toBeDisabled();
    });

    it('should show error when login fails', async () => {
      mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
      renderWithRouter();

      const identityInput = screen.getByPlaceholderText(/Email atau Username/i);
      const passwordInput = document.querySelector('input[type="password"]');
      fireEvent.change(identityInput, { target: { value: 'buyer.test@ghub.local' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      fireEvent.click(screen.getByText('Masuk'));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should handle 2FA requirement', async () => {
      mockLogin.mockResolvedValue({
        success: true,
        twoFactorRequired: true,
        userId: 1,
      });
      renderWithRouter();

      const identityInput = screen.getByPlaceholderText(/Email atau Username/i);
      const passwordInput = document.querySelector('input[type="password"]');
      fireEvent.change(identityInput, { target: { value: 'buyer.test@ghub.local' } });
      fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });

      fireEvent.click(screen.getByText('Masuk'));

      await waitFor(() => {
        expect(screen.getByText('Verifikasi 2FA')).toBeInTheDocument();
      });
    });
  });

  describe('password visibility', () => {
    it('should toggle password visibility', () => {
      renderWithRouter();
      const toggleButton = screen.getByRole('button', { name: /tampilkan/i });
      fireEvent.click(toggleButton);
      expect(screen.getByRole('button', { name: /sembunyikan/i })).toBeInTheDocument();
    });
  });

  describe('password not exposed in errors', () => {
    it('should not include password in error messages', async () => {
      mockLogin.mockResolvedValue({ success: false, message: 'Password salah' });
      renderWithRouter();

      const identityInput = screen.getByPlaceholderText(/Email atau Username/i);
      const passwordInput = document.querySelector('input[type="password"]');
      fireEvent.change(identityInput, { target: { value: 'buyer.test@ghub.local' } });
      fireEvent.change(passwordInput, { target: { value: 'MySecretPassword123' } });

      fireEvent.click(screen.getByText('Masuk'));

      await waitFor(() => {
        expect(screen.queryByText(/MySecretPassword123/i)).not.toBeInTheDocument();
      });
    });
  });
});
