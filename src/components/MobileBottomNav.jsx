import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/marketplace', label: 'Games', icon: 'fa-gamepad' },
  { to: '/cart', label: 'Cart', icon: 'fa-bag-shopping' },
  { to: '/buyer/messages', label: 'Chat', icon: 'fa-comments' },
  { to: '/account', label: 'Me', icon: 'fa-user' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const isFocusedFlow = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].some((path) => location.pathname.startsWith(path));
  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  if (isFocusedFlow) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi utama mobile">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={isActive(item.to) ? 'is-active' : ''} aria-current={isActive(item.to) ? 'page' : undefined}>
          <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
