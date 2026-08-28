import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../../pages/Cart';
import { CartProvider } from '../../context/CartContext';

vi.mock('../../services/api', () => ({
  default: { defaults: { headers: { common: {} } } },
}));

vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

const mockCartItem = {
  id: 1,
  slug: 'mlbb-account-mythic-1',
  title: 'Akun Mobile Legends Rank Mythic',
  price: 450000,
  quantity: 1,
  image: '/assets/products/mlbb-acc-1.jpg',
  game: 'Mobile Legends',
  sellerName: 'Pro Gamer Store',
};

describe('Cart page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should show empty cart message when cart is empty', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Keranjang kosong')).toBeInTheDocument();
  });

  it('should show explore link when cart is empty', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Jelajahi Marketplace')).toBeInTheDocument();
  });

  it('should display cart title and breadcrumb', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getAllByText('Keranjang').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should show clear cart button when items exist', async () => {
    localStorage.setItem('ghub_cart', JSON.stringify([mockCartItem]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Kosongkan')).toBeInTheDocument();
  });

  it('should show checkout button when items exist', async () => {
    localStorage.setItem('ghub_cart', JSON.stringify([mockCartItem]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/Lanjut ke Checkout/i)).toBeInTheDocument();
  });

  it('should show item count when cart has items', async () => {
    localStorage.setItem('ghub_cart', JSON.stringify([mockCartItem]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/1 item dalam keranjang/i)).toBeInTheDocument();
  });

  it('should display product title in cart', async () => {
    localStorage.setItem('ghub_cart', JSON.stringify([mockCartItem]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Akun Mobile Legends Rank Mythic')).toBeInTheDocument();
  });

  it('should display formatted price', async () => {
    localStorage.setItem('ghub_cart', JSON.stringify([mockCartItem]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getAllByText(/450.000/).length).toBeGreaterThanOrEqual(1);
  });

  it('should allow increasing quantity', async () => {
    localStorage.setItem('ghub_cart', JSON.stringify([mockCartItem]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    const plusButton = screen.getAllByText('+');
    fireEvent.click(plusButton[0]);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should allow decreasing quantity', async () => {
    const itemWithQty = { ...mockCartItem, quantity: 2 };
    localStorage.setItem('ghub_cart', JSON.stringify([itemWithQty]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    const minusButton = screen.getAllByText('−');
    fireEvent.click(minusButton[0]);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should remove item from cart', async () => {
    localStorage.setItem('ghub_cart', JSON.stringify([mockCartItem]));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    const removeButton = screen.getByText('Hapus');
    fireEvent.click(removeButton);
    expect(screen.queryByText('Akun Mobile Legends Rank Mythic')).not.toBeInTheDocument();
  });

  it('should clear all items from cart', async () => {
    const twoItems = [mockCartItem, { ...mockCartItem, slug: 'other', title: 'Other Product' }];
    localStorage.setItem('ghub_cart', JSON.stringify(twoItems));
    render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
    const clearButton = screen.getByText('Kosongkan');
    fireEvent.click(clearButton);
    expect(screen.getByText('Keranjang kosong')).toBeInTheDocument();
  });
});
