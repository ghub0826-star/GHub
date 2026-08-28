import api from './api';

// ---------- Seller Fulfillment ----------
export async function sellerStartProcessing(orderOrSubOrderId) {
  return api.post(`/orders/fulfillment/${orderOrSubOrderId}/start`);
}

export async function sellerDeliver(orderOrSubOrderId, { deliveryType, payload }) {
  return api.post(`/orders/fulfillment/${orderOrSubOrderId}/deliver`, { deliveryType, payload });
}

export async function uploadDeliveryEvidence(orderId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/orders/fulfillment/${orderId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function getDeliveryEvidence(orderId) {
  return api.get(`/orders/fulfillment/${orderId}/evidence`);
}

export async function deleteDeliveryEvidence(fileId) {
  return api.delete(`/orders/fulfillment/evidence/${fileId}`);
}

export async function getOrderTimeline(orderId) {
  return api.get(`/orders/fulfillment/${orderId}/timeline`);
}

export async function sellerRespondDispute(subOrderId, { disputeId, message }) {
  return api.post(`/orders/fulfillment/${subOrderId}/respond-dispute`, { disputeId, message });
}

// ---------- Buyer Actions ----------
export async function buyerComplete(orderId) {
  return api.post(`/orders/fulfillment/${orderId}/complete`);
}

export async function buyerOpenDispute(orderId, { reason, description }) {
  return api.post(`/orders/fulfillment/${orderId}/disputes`, { reason, description });
}

export async function getMyDisputes() {
  return api.get('/orders/fulfillment/disputes/mine');
}

// ---------- Shared Dispute ----------
export async function getDispute(disputeId) {
  return api.get(`/orders/fulfillment/disputes/${disputeId}`);
}

export async function postDisputeMessage(disputeId, message) {
  return api.post(`/orders/fulfillment/disputes/${disputeId}/message`, { message });
}

// ---------- Admin ----------
export async function adminGetDisputes() {
  return api.get('/orders/fulfillment/admin/disputes');
}

export async function adminRequestInfo(disputeId) {
  return api.post(`/orders/fulfillment/admin/disputes/${disputeId}/request-info`);
}

export async function adminResolveDispute(disputeId, { decision, reason, refundAmount }) {
  return api.post(`/orders/fulfillment/admin/disputes/${disputeId}/resolve`, { decision, reason, refundAmount });
}

export async function adminExecuteRefund(refundId) {
  return api.post(`/orders/fulfillment/admin/refunds/${refundId}/execute`);
}

// ---------- Seller Wallet ----------
export async function getMyWallet() {
  return api.get('/seller-wallets/mine');
}

export async function getMyLedger() {
  return api.get('/seller-wallets/mine/ledger');
}

export default {
  sellerStartProcessing,
  sellerDeliver,
  uploadDeliveryEvidence,
  getDeliveryEvidence,
  deleteDeliveryEvidence,
  getOrderTimeline,
  sellerRespondDispute,
  buyerComplete,
  buyerOpenDispute,
  getMyDisputes,
  getDispute,
  postDisputeMessage,
  adminGetDisputes,
  adminRequestInfo,
  adminResolveDispute,
  adminExecuteRefund,
  getMyWallet,
  getMyLedger,
};
