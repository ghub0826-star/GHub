import React from 'react';
import { useParams } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import ProductForm from '../../components/seller/ProductForm';

export default function SellerProductEdit() {
  const { productId } = useParams();

  return (
    <SellerLayout>
      <div>
        <h1>Edit Produk</h1>
        {/* ProductForm handles fetch & update internally when productId is given */}
        <ProductForm productId={productId} />
      </div>
    </SellerLayout>
  );
}
