import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { CartProvider, useCart, CartContext } from '../../context/CartContext';

const mockProduct = {
  id: 1,
  slug: 'test-product-1',
  title: 'Test Product',
  price: 100000,
  stock: 5,
  image: '/test.jpg',
  sellerName: 'Test Seller',
  game: 'Test Game',
};

function TestConsumer() {
  const cart = useContext(CartContext);
  return (
    <div>
      <span data-testid="count">{cart.getCartItemCount()}</span>
      <span data-testid="total">{cart.getCartTotal()}</span>
      <span data-testid="items">{cart.cart.length}</span>
      <button data-testid="add" onClick={() => cart.addToCart(mockProduct, 1)}>Add</button>
      <button data-testid="remove" onClick={() => cart.removeFromCart('test-product-1')}>Remove</button>
      <button data-testid="update" onClick={() => cart.updateQuantity('test-product-1', 3)}>Update</button>
      <button data-testid="clear" onClick={() => cart.clearCart()}>Clear</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start with empty cart', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(getByTestId('count').textContent).toBe('0');
    expect(getByTestId('total').textContent).toBe('0');
    expect(getByTestId('items').textContent).toBe('0');
  });

  it('should add item to cart', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      getByTestId('add').click();
    });
    expect(getByTestId('items').textContent).toBe('1');
    expect(getByTestId('count').textContent).toBe('1');
    expect(getByTestId('total').textContent).toBe('100000');
  });

  it('should increase quantity when adding same product', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      getByTestId('add').click();
      getByTestId('add').click();
    });
    expect(getByTestId('count').textContent).toBe('2');
    expect(getByTestId('total').textContent).toBe('200000');
  });

  it('should respect stock limit when adding', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      for (let i = 0; i < 10; i++) {
        getByTestId('add').click();
      }
    });
    expect(getByTestId('count').textContent).toBe('5');
  });

  it('should remove item from cart', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      getByTestId('add').click();
      getByTestId('remove').click();
    });
    expect(getByTestId('items').textContent).toBe('0');
    expect(getByTestId('total').textContent).toBe('0');
  });

  it('should update quantity', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      getByTestId('add').click();
      getByTestId('update').click();
    });
    expect(getByTestId('count').textContent).toBe('3');
  });

  it('should not allow quantity below 1', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      getByTestId('add').click();
      getByTestId('update').click();
    });
    expect(getByTestId('count').textContent).toBe('3');
  });

  it('should clear cart', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      getByTestId('add').click();
      getByTestId('add').click();
      getByTestId('clear').click();
    });
    expect(getByTestId('items').textContent).toBe('0');
    expect(getByTestId('total').textContent).toBe('0');
  });

  it('should persist cart to localStorage', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      getByTestId('add').click();
    });
    const saved = localStorage.getItem('ghub_cart');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved);
    expect(parsed.length).toBe(1);
    expect(parsed[0].slug).toBe('test-product-1');
  });

  it('should load cart from localStorage', () => {
    const savedCart = [{ ...mockProduct, quantity: 2 }];
    localStorage.setItem('ghub_cart', JSON.stringify(savedCart));

    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(getByTestId('items').textContent).toBe('1');
    expect(getByTestId('count').textContent).toBe('2');
  });

  it('should handle corrupt localStorage', () => {
    localStorage.setItem('ghub_cart', 'not-valid-json');

    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(getByTestId('items').textContent).toBe('0');
  });

  it('should handle empty array in localStorage', () => {
    localStorage.setItem('ghub_cart', JSON.stringify([]));

    const { getByTestId } = render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(getByTestId('items').textContent).toBe('0');
  });

  it('should add product with options', () => {
    const productWithOptions = { ...mockProduct, slug: 'test-product-2' };
    function TestWithOptions() {
      const cart = useContext(CartContext);
      return (
        <button
          onClick={() => cart.addToCart(productWithOptions, 1, { server: 'SEA-1' })}
        >
          AddWithOptions
        </button>
      );
    }
    const { getByText } = render(
      <CartProvider>
        <TestWithOptions />
      </CartProvider>
    );
    act(() => {
      getByText('AddWithOptions').click();
    });
    const saved = JSON.parse(localStorage.getItem('ghub_cart'));
    expect(saved[0].options).toEqual({ server: 'SEA-1' });
  });
});
