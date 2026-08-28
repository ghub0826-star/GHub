import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar(){
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ddRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function onDoc(e){
      if(ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className='header navbar'>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className='brand' style={{marginRight:8}}>
          <Link to='/' style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'inherit'}}>
            <div className='logo'><i className='fa-solid fa-g'></i></div>
            <div style={{marginLeft:6}}>
              <div style={{fontWeight:700}}>GHub</div>
              <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>Game Marketplace</div>
            </div>
          </Link>
        </div>

        <div className='category-dropdown'>
          <Link to='/' className='cta-outline' style={{display:'flex',alignItems:'center',gap:8}}>
            Kategori <i className='fa-solid fa-caret-down' />
          </Link>
        </div>

        <div style={{marginLeft:12}} className='search-box'>
          <input placeholder='Cari game, item, akun...' />
          <button className='button small' style={{marginLeft:8}}><i className='fa-solid fa-magnifying-glass'></i></button>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link to='/seller/register' className='cta-outline'>Jadi Seller</Link>
        <Link to='/help' className='cta-outline'>Bantuan</Link>
        <Link to='/cart' className='cta-outline'><i className='fa-solid fa-cart-shopping'></i></Link>

        {!user ? (
          <>
            <Link to='/login' className='button small' style={{background:'transparent',color:'white',border:'1px solid rgba(255,255,255,0.06)'}}>Masuk</Link>
            <Link to='/register' className='button small'>Daftar</Link>
          </>
        ) : (
          <div ref={ddRef} style={{position:'relative'}}>
            <div onClick={() => setOpen((v)=>!v)} className='avatar' style={{cursor:'pointer'}}>{user.username?.charAt(0)?.toUpperCase()}</div>
            {open && (
              <div className='card' style={{position:'absolute',right:0,top:44,minWidth:180,zIndex:40}}>
                <Link to='/dashboard' onClick={()=>setOpen(false)} style={{display:'block',padding:'8px 6px'}}>Dashboard</Link>
                <Link to='/dashboard/orders' onClick={()=>setOpen(false)} style={{display:'block',padding:'8px 6px'}}>Pesanan Saya</Link>
                <Link to='/dashboard/messages' onClick={()=>setOpen(false)} style={{display:'block',padding:'8px 6px'}}>Pesan</Link>
                <Link to='/dashboard/wishlist' onClick={()=>setOpen(false)} style={{display:'block',padding:'8px 6px'}}>Wishlist</Link>
                <Link to='/dashboard/profile' onClick={()=>setOpen(false)} style={{display:'block',padding:'8px 6px'}}>Pengaturan</Link>
                <div onClick={handleLogout} style={{display:'block',padding:'8px 6px',cursor:'pointer'}}>Keluar</div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
