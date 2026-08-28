import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../pages/Auth/Register';
import { register as registerSvc } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  register: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: null, isLoading: false }),
}));

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Register />
      </BrowserRouter>
    );
  };

  describe('rendering', () => {
    it('should render registration form', () => {
      renderRegister();
      expect(screen.getByText('Daftar Akun Baru')).toBeInTheDocument();
    });

    it('should have all form fields', () => {
      renderRegister();
      expect(document.querySelector('input[type="text"]')).toBeInTheDocument();
      expect(document.querySelector('input[type="email"]')).toBeInTheDocument();
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      expect(passwordInputs.length).toBe(2);
    });

    it('should have terms checkbox', () => {
      renderRegister();
      expect(document.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show error when full name is empty', async () => {
      renderRegister();
      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      const confirmInput = document.querySelectorAll('input[type="password"]')[1];
      fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'TestPass123!' } });
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText('Daftar'));

      await waitFor(() => {
        expect(screen.getByText('Nama lengkap wajib diisi')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      renderRegister();
      const textInputs = document.querySelectorAll('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      fireEvent.change(textInputs[0], { target: { value: 'Test User' } });
      fireEvent.change(textInputs[1], { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      const confirmInput = document.querySelectorAll('input[type="password"]')[1];
      fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'TestPass123!' } });
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText('Daftar'));

      await waitFor(() => {
        expect(screen.getByText('Email tidak valid')).toBeInTheDocument();
      });
    });

    it('should show error for weak password (less than 8 chars)', async () => {
      renderRegister();
      const textInputs = document.querySelectorAll('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      fireEvent.change(textInputs[0], { target: { value: 'Test User' } });
      fireEvent.change(textInputs[1], { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      const confirmInput = document.querySelectorAll('input[type="password"]')[1];
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmInput, { target: { value: 'weak' } });
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText('Daftar'));

      await waitFor(() => {
        expect(screen.getByText(/Password minimal 8 karakter/i)).toBeInTheDocument();
      });
    });

    it('should show error for password without uppercase', async () => {
      renderRegister();
      const textInputs = document.querySelectorAll('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      fireEvent.change(textInputs[0], { target: { value: 'Test User' } });
      fireEvent.change(textInputs[1], { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      const confirmInput = document.querySelectorAll('input[type="password"]')[1];
      fireEvent.change(passwordInput, { target: { value: 'alllowercase1' } });
      fireEvent.change(confirmInput, { target: { value: 'alllowercase1' } });
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText('Daftar'));

      await waitFor(() => {
        expect(screen.getByText(/Password harus memiliki huruf besar, huruf kecil, dan angka/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      renderRegister();
      const textInputs = document.querySelectorAll('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      fireEvent.change(textInputs[0], { target: { value: 'Test User' } });
      fireEvent.change(textInputs[1], { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      const confirmInput = document.querySelectorAll('input[type="password"]')[1];
      fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Different123!' } });
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText('Daftar'));

      await waitFor(() => {
        expect(screen.getByText('Konfirmasi password tidak cocok')).toBeInTheDocument();
      });
    });

    it('should show error when terms not agreed', async () => {
      renderRegister();
      const textInputs = document.querySelectorAll('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const phoneInput = document.querySelectorAll('input[type="text"]')[2];
      fireEvent.change(textInputs[0], { target: { value: 'Test User' } });
      fireEvent.change(textInputs[1], { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(phoneInput, { target: { value: '6281234567890' } });
      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      const confirmInput = document.querySelectorAll('input[type="password"]')[1];
      fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'TestPass123!' } });
      fireEvent.click(screen.getByText('Daftar'));

      expect(screen.getByText('Anda harus menyetujui Syarat dan Ketentuan')).toBeInTheDocument();
    });
  });

  describe('successful registration', () => {
    it('should call register service with correct data and navigate to verify-email', async () => {
      registerSvc.mockResolvedValue({ data: { success: true, message: 'User registered' } });

      const mockNavigate = vi.fn();
      vi.doMock('react-router-dom', () => ({
        ...vi.importActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      renderRegister();

      const textInputs = document.querySelectorAll('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const phoneInput = document.querySelectorAll('input[type="text"]')[2];
      fireEvent.change(textInputs[0], { target: { value: 'Test User' } });
      fireEvent.change(textInputs[1], { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(phoneInput, { target: { value: '6281234567890' } });
      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      const confirmInput = document.querySelectorAll('input[type="password"]')[1];
      fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'TestPass123!' } });
      const checkbox = document.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText('Daftar'));

      await waitFor(() => {
        expect(registerSvc).toHaveBeenCalledWith({
          full_name: 'Test User',
          username: 'testuser',
          email: 'test@test.com',
          phone: '6281234567890',
          password: 'TestPass123!',
        });
      });
    });
  });
});
