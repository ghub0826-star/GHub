import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';

const mockProduct = {
  id: 1,
  slug: 'mlbb-account-mythic-1',
  title: 'Akun Mobile Legends Rank Mythic',
  price: 450000,
  rating: 4.9,
  reviews: 1250,
  delivery: 'Instant',
  seller: {
    name: 'Pro Gamer Store',
    verified: true,
  },
  image: '/assets/products/mlbb-acc-1.jpg',
};

describe('ProductCard', () => {
  const renderCard = (product = mockProduct) => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProductCard product={product} />
      </BrowserRouter>
    );
  };

  it('should render product title', () => {
    renderCard();
    expect(screen.getByText('Akun Mobile Legends Rank Mythic')).toBeInTheDocument();
  });

  it('should render product price in IDR format', () => {
    renderCard();
    expect(screen.getByText(/450.000/)).toBeInTheDocument();
  });

  it('should render product rating and reviews', () => {
    renderCard();
    expect(screen.getByText(/4\.9/)).toBeInTheDocument();
    expect(screen.getByText(/1250/)).toBeInTheDocument();
  });

  it('should render seller name and verified badge', () => {
    renderCard();
    expect(screen.getByText(/Pro Gamer Store/)).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render product image with alt text', () => {
    renderCard();
    const img = screen.getByAltText('Akun Mobile Legends Rank Mythic');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('mlbb-acc-1.jpg');
  });

  it('should use fallback image when no image provided', () => {
    renderCard({ ...mockProduct, image: null });
    const img = screen.getByAltText('Akun Mobile Legends Rank Mythic');
    expect(img.src).toContain('picsum.photos');
  });

  it('should use fallback image when image is empty string', () => {
    renderCard({ ...mockProduct, image: '' });
    const img = screen.getByAltText('Akun Mobile Legends Rank Mythic');
    expect(img.src).toContain('picsum.photos');
  });

  it('should link to product page using slug', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link.href).toContain('/product/mlbb-account-mythic-1');
  });

  it('should fall back to id in link if slug is missing', () => {
    renderCard({ ...mockProduct, slug: null });
    const link = screen.getByRole('link');
    expect(link.href).toContain('/product/1');
  });

  it('should not show verified badge when seller is not verified', () => {
    renderCard({
      ...mockProduct,
      seller: { name: 'New Seller', verified: false },
    });
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('should handle missing seller data gracefully', () => {
    renderCard({ ...mockProduct, seller: undefined });
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('should format price with toLocaleString', () => {
    renderCard({ ...mockProduct, price: 1500000 });
    expect(screen.getByText(/1.500.000/)).toBeInTheDocument();
  });
});
