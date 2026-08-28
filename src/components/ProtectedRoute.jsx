import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

function normalizeRole(role) {
  const r = String(role || '').trim().toUpperCase();
  if (['USER', 'BUYER', 'CUSTOMER'].includes(r)) return 'BUYER';
  if (['ADMIN', 'SUPER_ADMIN'].includes(r)) return 'ADMIN';
  return r;
}

export default function ProtectedRoute({ children, allowedRoles, requireSellerApproved }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // or a loader component

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  const currentRole = user.role || 'USER';
  const normalizedUserRole = normalizeRole(currentRole);

  if (allowedRoles && allowedRoles.length > 0) {
    // Cek SUPER_ADMIN dari role utama ATAU legacyRole (safety net untuk backward compat)
    const isSuperAdmin =
      currentRole === 'SUPER_ADMIN' ||
      String(user.legacyRole || '').trim().toUpperCase() === 'SUPER_ADMIN';
    const isAdmin  = currentRole === 'ADMIN' || isSuperAdmin;
    const isSeller = currentRole === 'SELLER';
    const isBuyer  = currentRole === 'USER' || currentRole === 'BUYER';

    // Jika route hanya untuk SUPER_ADMIN saja (tidak ada ADMIN di list)
    const superAdminOnly = allowedRoles.every(r => r === 'SUPER_ADMIN') && !allowedRoles.includes('ADMIN');

    let hasAllowedRole = false;
    if (superAdminOnly) {
      // Eksklusif — hanya SUPER_ADMIN, bukan ADMIN biasa
      hasAllowedRole = isSuperAdmin;
    } else {
      hasAllowedRole = allowedRoles.some(r => {
        switch (String(r).toUpperCase()) {
          case 'SUPER_ADMIN': return isSuperAdmin;
          case 'ADMIN':       return isAdmin;
          case 'SELLER':      return isSeller;
          case 'BUYER':
          case 'USER':        return isBuyer;
          default:            return currentRole === String(r).toUpperCase();
        }
      });
    }

    if (!hasAllowedRole) {
      // Buyer mencoba akses area seller → arahkan ke register seller
      if (allowedRoles.includes('SELLER') && isBuyer) {
        return <Navigate to='/seller/register' replace />;
      }
      return <Navigate to='/unauthorized' replace />;
    }
  }

  if (requireSellerApproved) {
    // enforce seller role and sellerStatus
    if (normalizedUserRole !== 'SELLER') {
      return <Navigate to='/seller/register' replace />;
    }
    const status = user.sellerStatus || 'NOT_SELLER';
    if (status === 'PENDING' || status === 'REJECTED') {
      return <Navigate to='/seller/pending' replace />;
    }
    if (status === 'SUSPENDED') {
      return <Navigate to='/unauthorized' replace />;
    }
    if (status !== 'APPROVED') {
      // default block
      return <Navigate to='/seller/pending' replace />;
    }
  }

  return children;
}

