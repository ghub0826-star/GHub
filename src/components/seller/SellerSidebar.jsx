import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SellerSidebar(){
  return (
    <aside className='seller-sidebar'>
      <div className='logo'>GHub Seller</div>
      <nav>
        <NavLink to='/seller/dashboard'>Dashboard</NavLink>
        <NavLink to='/seller/products'>Produk</NavLink>
        <NavLink to='/seller/products/new'>Tambah Produk</NavLink>
        <NavLink to='/seller/orders'>Pesanan</NavLink>
        <NavLink to='/seller/earnings'>Pendapatan</NavLink>
        <NavLink to='/seller/balance'>Saldo</NavLink>
        <NavLink to='/seller/store'>Toko Saya</NavLink>
        <NavLink to='/seller/profile'>Profil</NavLink>
        <NavLink to='/seller/settings'>Pengaturan</NavLink>
      </nav>
    </aside>
  );
}
