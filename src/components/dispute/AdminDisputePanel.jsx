import React, { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';

const DECISIONS = ['RESOLVE_TO_BUYER', 'RESOLVE_TO_SELLER', 'PARTIAL_REFUND', 'REQUEST_MORE_INFO', 'CLOSE_DISPUTE'];

// Admin panel to resolve a dispute, request info, or execute refund.
export default function AdminDisputePanel({ dispute, onResolve, onRequestInfo, onExecuteRefund, actionLoading }) {
  const [decision, setDecision] = useState(DECISIONS[0]);
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  if (!dispute) return null;

  return (
    <div className='card' style={{ marginTop: 12 }}>
      <h4>Panel Admin</h4>
      <div>Dispute #{dispute.dispute_number} — Status: {dispute.status}</div>
      <div style={{ marginTop: 8 }}>Order: {dispute.order_number}</div>
      <div>Total: {formatCurrency(dispute.total_amount)}</div>

      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <select value={decision} onChange={(e) => setDecision(e.target.value)}>
          {DECISIONS.map((d) => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
        </select>
        {decision === 'PARTIAL_REFUND' && (
          <input type='number' placeholder='Jumlah refund' value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))} />
        )}
        <textarea placeholder='Alasan keputusan' value={reason} onChange={(e) => setReason(e.target.value)} />
        <button className='button' onClick={() => onResolve && onResolve(decision, reason, refundAmount)} disabled={actionLoading}>
          {actionLoading ? 'Memproses...' : 'Selesaikan Dispute'}
        </button>
        <button className='button secondary' onClick={() => onRequestInfo && onRequestInfo()} disabled={actionLoading}>
          Minta Info Tambahan
        </button>
        <button className='button secondary' onClick={() => onExecuteRefund && onExecuteRefund()} disabled={actionLoading}>
          Eksekusi Refund
        </button>
      </div>
    </div>
  );
}
