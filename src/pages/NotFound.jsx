import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div className='container'>
      <div className='card'>
        <h1>404 — Halaman Tidak Ditemukan</h1>
        <p>Halaman yang Anda cari tidak tersedia.</p>
        <div style={{display:'flex',gap:12}}>
          <Link to='/' className='button'>Kembali ke Homepage</Link>
        </div>
      </div>
    </div>
  );
}
