import React, { createContext, useContext, useEffect, useState } from 'react';

export const CartContext = createContext(null);
const STORAGE_KEY = 'ghub_cart';

export function CartProvider({ children }){
  const [cart, setCart] = useState([]);

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw){
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch(e){
      console.warn('Failed to load cart', e);
      setCart([]);
    }
  }, []);

  useEffect(()=>{
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }catch(e){console.warn('Failed to save cart', e)}
  }, [cart]);

  const findIndex = (product) => cart.findIndex(i => i.slug === product.slug);

  function addToCart(product, quantity=1, options={}){
    if (!product) return;
    setCart((prev)=>{
      const idx = prev.findIndex(i=> i.slug === product.slug && JSON.stringify(i.options||{})===JSON.stringify(options||{}));
      if (idx >= 0){
        const copy = [...prev];
        copy[idx].quantity = Math.min((copy[idx].quantity||0) + quantity, product.stock || 999999);
        return copy;
      }
      return [...prev, { ...product, quantity: Math.max(1, quantity), options }];
    });
  }

  function removeFromCart(slug){
    setCart(prev => prev.filter(i => i.slug !== slug));
  }

  function updateQuantity(slug, quantity){
    setCart(prev => prev.map(i => i.slug === slug ? { ...i, quantity: Math.max(1, quantity) } : i));
  }

  function clearCart(){ setCart([]); }

  function getCartItemCount(){ return cart.reduce((s,i)=> s + (i.quantity||0), 0); }

  function getCartTotal(){ return cart.reduce((s,i)=> s + (i.price || 0) * (i.quantity||1), 0); }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartItemCount, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(){
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
}
