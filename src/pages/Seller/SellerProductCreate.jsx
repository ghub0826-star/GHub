import React from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import ProductForm from '../../components/seller/ProductForm';

export default function SellerProductCreate() {
  return (
    <SellerLayout>
      <div>
        <h1>Tambah Produk</h1>
        <ProductForm />
      </div>
    </SellerLayout>
  );
}
