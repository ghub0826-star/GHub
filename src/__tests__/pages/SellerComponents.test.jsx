import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import SellerProducts from '../../pages/Seller/SellerProducts';
import SellerEarnings from '../../pages/Seller/SellerEarnings';
import SellerPending from '../../pages/Seller/SellerPending';
import * as sellerService from '../../services/sellerService';

vi.mock('../../services/sellerService');

describe('Seller Pages & Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SellerProducts', () => {
    it('renders loading and then product list successfully', async () => {
      sellerService.getProducts.mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Item 1', game: 'Mobile Legends', price: 50000, stock: 10 }
        ]
      });

      render(<SellerProducts />);
      expect(screen.getByText(/Memuat produk.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Mobile Legends')).toBeInTheDocument();
      });
    });

    it('handles empty products gracefully without crashing', async () => {
      sellerService.getProducts.mockResolvedValueOnce({ data: [] });

      render(<SellerProducts />);
      await waitFor(() => {
        expect(screen.getByText(/Belum ada produk/i)).toBeInTheDocument();
      });
    });

    it('handles API failure gracefully without crashing', async () => {
      sellerService.getProducts.mockRejectedValueOnce(new Error('Network error'));

      render(<SellerProducts />);
      await waitFor(() => {
        expect(screen.getByText(/Belum ada produk/i)).toBeInTheDocument();
      });
    });
  });

  describe('SellerEarnings', () => {
    it('renders earnings data properly', async () => {
      sellerService.getEarnings.mockResolvedValueOnce({
        data: { today: 150000, month: 2500000, total: 10000000 }
      });

      render(<SellerEarnings />);
      await waitFor(() => {
        expect(screen.getByText(/Rp 150.000/i)).toBeInTheDocument();
        expect(screen.getByText(/Rp 2.500.000/i)).toBeInTheDocument();
        expect(screen.getByText(/Rp 10.000.000/i)).toBeInTheDocument();
      });
    });

    it('handles API rejection with fallback values instead of hanging in loading', async () => {
      sellerService.getEarnings.mockRejectedValueOnce(new Error('Fetch failed'));

      render(<SellerEarnings />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Pendapatan/i })).toBeInTheDocument();
        expect(screen.getAllByText(/Rp 0/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('SellerPending', () => {
    it('renders pending status when application is PENDING', async () => {
      sellerService.getSellerApplication.mockResolvedValueOnce({
        data: { status: 'PENDING' }
      });

      render(<SellerPending />);
      await waitFor(() => {
        expect(screen.getByText(/Pengajuan Seller Sedang Ditinjau/i)).toBeInTheDocument();
      });
    });

    it('renders CTA link to register when application does not exist', async () => {
      sellerService.getSellerApplication.mockResolvedValueOnce({
        data: null
      });

      render(<SellerPending />);
      await waitFor(() => {
        expect(screen.getByText(/Belum Ada Pengajuan Seller/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Daftar Jadi Seller Sekarang/i })).toBeInTheDocument();
      });
    });
  });
});
