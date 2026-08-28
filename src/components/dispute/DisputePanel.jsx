import React, { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';

const DISPUTE_REASONS = [
  'PRODUCT_NOT_AS_DESCRIBED',
  'ITEM_NOT_RECEIVED',
  'ACCOUNT_LOGIN_FAILED',
  'FRAUD_SUSPICION',
  'OTHER',
];

// Dispute panel: used by buyer to open a dispute, or display existing dispute.
export default function DisputePanel({ order, dispute, onOpenDispute, onSendMessage, actionLoading }) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  if (dispute) {
    return (
      <div className='card' style={{ marginTop: 12 }}>
        <h4>Dispute #{dispute.dispute_number}</h4>
        <div className='muted'>Status: {dispute.status}</div>
        <div className='muted'>Alasan: {dispute.reason}</div>
        <div style={{ marginTop: 8 }}>{dispute.description}</div>

        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          {dispute.messages && dispute.messages.map((m) => (
            <div key={m.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 8 }}>
              <strong>{m.sender_type}:</strong> {m.message}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input placeholder='Ketik pesan' value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className='button' onClick={() => onSendMessage && onSendMessage(message)} disabled={actionLoading || !message}>
            Kirim
          </button>
        </div>
      </div>
    );
  }

  if (order && order.order_status === 'DELIVERED') {
    return (
      <div className='card' style={{ marginTop: 12 }}>
        <h4>Buka Dispute</h4>
        <p className='muted'>Jika produk bermasalah, kamu dapat membuka dispute.</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {DISPUTE_REASONS.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
          <textarea placeholder='Deskripsi masalah' value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className='button' onClick={() => onOpenDispute && onOpenDispute(reason, description)} disabled={actionLoading || !description}>
            {actionLoading ? 'Membuka...' : 'Buka Dispute'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
