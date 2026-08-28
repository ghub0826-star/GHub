import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function SellerRegister(){
  const [storeName, setStoreName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/seller/register', { name: storeName });
      navigate('/seller/pending');
    } catch (err) {
      console.error(err);
      alert('Gagal mendaftar sebagai seller');
    }
  };

  return (
    <div className='container'>
      <div className='card'>
        <h1>Daftar Jadi Seller</h1>
        <form onSubmit={handleSubmit}>
          <label>Nama Toko</label>
          <input value={storeName} onChange={(e)=>setStoreName(e.target.value)} required />
          <button className='button' type='submit'>Daftar</button>
        </form>
      </div>
    </div>
  );
}
