import api from './api';

export async function getOrder(orderNumber) {
  const res = await api.get(`/orders/${encodeURIComponent(orderNumber)}`);
  return res.data;
}

export async function getInvoice(orderNumber) {
  const res = await api.get(`/orders/${encodeURIComponent(orderNumber)}/invoice`);
  return res.data;
}

export async function retryPayment(orderNumber) {
  const res = await api.post(`/orders/${encodeURIComponent(orderNumber)}/retry-payment`);
  return res.data;
}

export async function getPaymentStatus(orderNumber) {
  const res = await api.get(`/orders/${encodeURIComponent(orderNumber)}/payment-status`);
  return res.data;
}

export async function getBuyerOrders() {
  const res = await api.get('/orders/buyer/mine');
  return res.data;
}

export async function getSellerOrders() {
  const res = await api.get('/orders/seller/mine');
  return res.data;
}

export default {
  getOrder,
  getInvoice,
  retryPayment,
  getPaymentStatus,
  getBuyerOrders,
  getSellerOrders,
};
