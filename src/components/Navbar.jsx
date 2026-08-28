import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBox from './SearchBox';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();

  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const ddRef = useRef(null);
  const navbarRef = useRef(null);
  const closeTimer = useRef(null);   // delay timer untuk category dropdown
  const navigate = useNavigate();

  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return undefined;

    const updateNavbarHeight = () => {
      document.documentElement.style.setProperty('--navbar-height', `${navbar.getBoundingClientRect().height}px`);
    };

    updateNavbarHeight();
    const observer = new ResizeObserver(updateNavbarHeight);
    observer.observe(navbar);
    window.addEventListener('resize', updateNavbarHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateNavbarHeight);
      // Cleanup category close timer
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  /* =========================================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
     ========================================================= */
  useEffect(() => {
    function onDoc(e) {
      if (
        ddRef.current &&
        !ddRef.current.contains(e.target)
      ) {
        setOpen(false);
      }

      if (!e.target.closest('.header-menu')) {
        setActiveMenu(null);
      }
    }

    document.addEventListener('click', onDoc);

    return () => {
      document.removeEventListener('click', onDoc);
    };
  }, []);

  /* =========================================================
     SCROLL DETECTION

     Atas:
       transparent

     Scroll > 24px:
       .scrolled
       background solid
       blur
       shadow
     ========================================================= */
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* =========================================================
     LOGOUT
     ========================================================= */
  const handleLogout = () => {
    logout();
    setOpen(false);
    setActiveMenu(null);
    navigate('/');
  };

  /* =========================================================
     CLOSE MENUS
     ========================================================= */
  const closeMenus = () => {
    setActiveMenu(null);
    setOpen(false);
  };

  /* =========================================================
     CATEGORY LINKS
     ========================================================= */
  const categoryLinks = [
    {
      label: 'Semua Produk',
      to: '/marketplace',
    },
    {
      label: 'Games',
      to: '/marketplace?category=games',
    },
    {
      label: 'Game Currency',
      to: '/marketplace?category=currency',
    },
    {
      label: 'Game Accounts',
      to: '/marketplace?category=accounts',
    },
    {
      label: 'Items',
      to: '/marketplace?category=items',
    },
    {
      label: 'Skins',
      to: '/marketplace?category=skins',
    },
    {
      label: 'Top Up',
      to: '/marketplace?category=top-up',
    },
    {
      label: 'Gift Cards',
      to: '/marketplace?category=gift-cards',
    },
    {
      label: 'Boosting',
      to: '/marketplace?category=boosting',
    },
    {
      label: 'Services',
      to: '/marketplace?category=services',
    },
    {
      label: 'Software',
      to: '/marketplace?category=software',
    },
    {
      label: 'Other',
      to: '/marketplace?category=other',
    },
  ];

  /* =========================================================
     ACCOUNT LINKS
     ========================================================= */
  const isSeller = user?.role === 'SELLER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const accountLinks = isSeller
    ? [
        { label: 'Seller Dashboard', to: '/seller/dashboard' },
        { label: 'Produk Saya', to: '/seller/products' },
        { label: 'Pesanan Masuk', to: '/seller/orders' },
        { label: 'Toko Saya', to: '/seller/profile' },
        { label: 'Pesan', to: '/messages' },
        { label: 'Notifikasi', to: '/notifications' },
        { label: 'Pengaturan', to: '/account' },
      ]
    : isAdmin
    ? [
        { label: 'Admin Dashboard', to: '/admin/dashboard' },
        { label: 'Enterprise', to: '/admin/enterprise' },
        { label: 'AI Platform', to: '/admin/ai' },
        { label: 'Pesan', to: '/buyer/messages' },
        { label: 'Notifikasi', to: '/notifications' },
        { label: 'Pengaturan', to: '/account' },
      ]
    : [
        { label: 'Buyer Dashboard', to: '/buyer/dashboard' },
        { label: 'Pesanan Saya', to: '/buyer/orders' },
        { label: 'Wishlist', to: '/buyer/wishlist' },
        { label: 'Pesan', to: '/buyer/messages' },
        { label: 'Notifikasi', to: '/notifications' },
        { label: 'Pengaturan', to: '/account' },
      ];


  /* =========================================================
     NAVBAR
     ========================================================= */
  return (
    <header
      ref={navbarRef}
      className={`header navbar ${scrolled ? 'scrolled' : ''
        }`}
    >
      <div className="header-row">

        {/* =====================================================
            BRAND
            ===================================================== */}
        <div className="brand">
          <Link
            to="/"
            onClick={closeMenus}
          >
            <div className="logo">
              <img
                src="/assets/Logo Ghub.png"
                alt="GHub Logo"
                className="navbar-logo-img"
              />
            </div>

            <div className="brand-text">
              <div className="brand-name">
                GHub
              </div>

              <div className="brand-tag">
                Digital Gaming Marketplace
              </div>
            </div>
          </Link>
        </div>

        {/* =====================================================
            CATEGORY MENU
            ===================================================== */}
        <div
          className="header-menu header-category-menu"
          onMouseEnter={() => {
            // Batalkan timer close jika ada
            if (closeTimer.current) clearTimeout(closeTimer.current);
            setActiveMenu('categories');
          }}
          onMouseLeave={() => {
            // Tunda close 120ms — memberi waktu kursor melewati gap 12px ke dropdown
            closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
          }}
        >
          <button
            type="button"
            className="header-menu-trigger category-trigger"
            aria-expanded={
              activeMenu === 'categories'
            }
            onClick={() =>
              setActiveMenu(
                activeMenu === 'categories'
                  ? null
                  : 'categories'
              )
            }
          >
            <i className="fa-solid fa-sliders" />

            <span>
              Kategori
            </span>

            <i className="fa-solid fa-chevron-down" />
          </button>

          {activeMenu === 'categories' && (
            <div
              className="header-dropdown category-dropdown"
              role="menu"
              onMouseEnter={() => {
                // Kursor masuk ke dropdown — batalkan timer close
                if (closeTimer.current) clearTimeout(closeTimer.current);
              }}
              onMouseLeave={() => {
                // Kursor keluar dari dropdown — tutup setelah delay singkat
                closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
              }}
            >
              {categoryLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenus}
                  role="menuitem"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            SEARCH
            ===================================================== */}
        <div className="header-search">
          <SearchBox />
        </div>

        {/* =====================================================
            HEADER ACTIONS
            ===================================================== */}
        <div className="header-actions">

          {/* Jadi Seller */}
          <Link
            to="/seller/register"
            className="header-action-link seller-link"
            onClick={closeMenus}
          >
            <i className="fa-solid fa-store" />

            <span>
              Jadi Seller
            </span>
          </Link>

          {/* Bantuan */}
          <Link
            to="/help"
            className="header-action-link help-link"
            onClick={closeMenus}
          >
            <i className="fa-regular fa-circle-question" />

            <span>
              Bantuan
            </span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="header-icon-link"
            aria-label="Cart"
            onClick={closeMenus}
          >
            <img
              src="/assets/shopping-bag.png"
              alt="Cart"
              className="navbar-cart-icon"
            />

            {getCartItemCount() > 0 && (
              <span className="header-count">
                {getCartItemCount()}
              </span>
            )}
          </Link>

          {/* =================================================
              USER BELUM LOGIN
              ================================================= */}
          {!user ? (
            <>
              <Link
                to="/login"
                className="button outline"
                onClick={closeMenus}
              >
                Masuk
              </Link>

              <Link
                to="/register"
                className="button"
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                }}

                onClick={closeMenus}
              >
                Daftar
              </Link>
            </>
          ) : (
            /* =================================================
               USER SUDAH LOGIN
               ================================================= */
            <div
              ref={ddRef}
              className="account-menu"
            >
              <button
                type="button"
                onClick={() =>
                  setOpen((v) => !v)
                }
                className="account-trigger"
                aria-expanded={open}
                aria-haspopup="menu"
              >
                <span className="account-avatar">
                  {user.username
                    ?.charAt(0)
                    ?.toUpperCase()}
                </span>

                <span className="account-name">
                  {user.username}
                </span>

                <i className="fa-solid fa-chevron-down" />
              </button>

              {open && (
                <div
                  className="account-dropdown"
                  role="menu"
                >
                  <div className="account-dropdown-head">
                    <strong>
                      {user.full_name ||
                        user.username}
                    </strong>

                    <span>
                      {isSeller ? 'Seller' : isAdmin ? 'Admin' : 'Buyer'}
                    </span>
                  </div>

                  {accountLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeMenus}
                      role="menuitem"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="account-logout"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}