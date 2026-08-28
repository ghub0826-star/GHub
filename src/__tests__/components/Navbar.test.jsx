import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

import { CartProvider } from '../../context/CartContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider>
        <Navbar />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not logged in', () => {
    it('should show Login and Register buttons', () => {
      useAuth.mockReturnValue({ user: null });
      renderNavbar();
      expect(screen.getByText('Masuk')).toBeInTheDocument();
      expect(screen.getByText('Daftar')).toBeInTheDocument();
    });

    it('should not show Dashboard menu', () => {
      useAuth.mockReturnValue({ user: null });
      renderNavbar();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('when buyer is logged in', () => {
    it('should show user avatar and dropdown', () => {
      useAuth.mockReturnValue({
        user: { id: 1, username: 'buyer', role: 'BUYER' },
        logout: vi.fn(),
      });
      renderNavbar();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should show Dashboard and Pesanan Saya in dropdown', () => {
      useAuth.mockReturnValue({
        user: { id: 1, username: 'buyer', role: 'BUYER' },
        logout: vi.fn(),
      });
      renderNavbar();
      const avatar = screen.getByText('B');
      fireEvent.click(avatar);
      expect(screen.getByText('Buyer Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Pesanan Saya')).toBeInTheDocument();
    });

    it('should show Logout button in dropdown', () => {
      const mockLogout = vi.fn();
      useAuth.mockReturnValue({
        user: { id: 1, username: 'buyer', role: 'BUYER' },
        logout: mockLogout,
      });
      renderNavbar();
      const avatar = screen.getByText('B');
      fireEvent.click(avatar);
      const logoutBtn = screen.getByText('Keluar');
      fireEvent.click(logoutBtn);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('when seller is logged in', () => {
    it('should show seller avatar', () => {
      useAuth.mockReturnValue({
        user: { id: 2, username: 'seller', role: 'SELLER' },
        logout: vi.fn(),
      });
      renderNavbar();
      expect(screen.getByText('S')).toBeInTheDocument();
    });
  });

  describe('when admin is logged in', () => {
    it('should show admin avatar', () => {
      useAuth.mockReturnValue({
        user: { id: 3, username: 'admin', role: 'ADMIN' },
        logout: vi.fn(),
      });
      renderNavbar();
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('logout behavior', () => {
    it('should call logout when Logout clicked', () => {
      const mockLogout = vi.fn();
      useAuth.mockReturnValue({
        user: { id: 1, username: 'buyer', role: 'BUYER' },
        logout: mockLogout,
      });
      renderNavbar();
      fireEvent.click(screen.getByText('B'));
      fireEvent.click(screen.getByText('Keluar'));
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
