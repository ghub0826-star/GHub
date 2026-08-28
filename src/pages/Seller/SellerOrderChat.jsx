import React, { useEffect, useState } from 'react';
import SellerLayout from '../../layouts/SellerLayout';
import { useParams } from 'react-router-dom';
import * as chatService from '../../services/chatService';
import ChatWindow from '../../components/chat/ChatWindow';
import { useAuth } from '../../context/AuthContext';

export default function SellerOrderChat(){
  const { orderNumber } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const res = await chatService.getConversationForOrder(orderNumber);
        if (!mounted) return;
        const conv = res?.conversation || res?.data?.conversation || res?.data;
        if (conv && conv.id) setConversation(conv);
        else setError('Percakapan tidak ditemukan');
      }catch(e){
        if (mounted) setError(e.response?.data?.message || 'Gagal memuat percakapan');
      }finally{
        if (mounted) setLoading(false);
      }
    })();
    return ()=>{ mounted=false; };
  }, [orderNumber]);

  if (loading) return <SellerLayout><div className='card'>Memuat chat...</div></SellerLayout>;
  if (error) return <SellerLayout><div className='card'>Error: {error}</div></SellerLayout>;

  const cid = conversation?.id;
  return (
    <SellerLayout>
      <div>
        <h2>Chat Order {orderNumber}</h2>
        <div style={{ marginTop: 12 }}>
          {cid ? (
            <ChatWindow
              conversationId={cid}
              orderNumber={orderNumber}
              currentUserId={user?.id}
              title={`Order ${orderNumber}`}
              subtitle='Percakapan dengan pembeli'
            />
          ) : (
            <div className='card'>Tidak ada percakapan untuk order ini.</div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
