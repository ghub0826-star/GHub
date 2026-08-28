import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const response = await api.get('/orders', { params: { seller_id: 1 } });
    setOrders(response.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleReleaseFunds = async (order) => {
    try {
      await api.post('/escrow/release', { order_number: order.order_number });
      loadOrders();
    } catch (error) {
      console.error(error);
      alert('Gagal melepaskan escrow');
    }
  };

  return (
    <div className='main-panel card'>
      <h2>Orders</h2>
      <ul>
        {orders.length === 0 && <li>Belum ada pesanan.</li>}
        {orders.map((order) => (
          <li key={order.id}>
            {order.order_number} — Rp {order.total_amount.toLocaleString()} — {order.order_status} — Escrow: {order.escrow_status}
            {order.escrow_status !== 'released' && (
              <button className='button small' onClick={() => handleReleaseFunds(order)}>
                Lepas Escrow
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
