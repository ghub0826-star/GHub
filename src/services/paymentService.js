import api from './api';

// Create a Midtrans Snap transaction (backend creates the token from DB data).
export async function createMidtransPayment(orderNumber) {
  const res = await api.post('/payment/midtrans/create', { orderNumber });
  return res.data;
}

// Get payment status for an order (backend verifies ownership).
export async function getPaymentStatus(orderNumber) {
  const res = await api.get(`/payment/${encodeURIComponent(orderNumber)}/status`);
  return res.data;
}

// Retry a payment (backend decides whether to reuse or create a new attempt).
export async function retryPayment(orderNumber) {
  const res = await api.post(`/payment/${encodeURIComponent(orderNumber)}/retry`);
  return res.data;
}

export default { createMidtransPayment, getPaymentStatus, retryPayment };
