import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function SellerMessages() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    api.get('/messages/1').then((response) => setMessages(response.data));
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    const response = await api.post('/messages/1', {
      sender_id: 2,
      receiver_id: 1,
      message: text,
    });
    setMessages((prev) => [...prev, response.data]);
    setText('');
  };

  return (
    <div className='main-panel card'>
      <h2>Messages</h2>
      <div className='chat-window'>
        {messages.map((msg) => (
          <div key={msg.id} className='chat-message'>
            <p>{msg.message}</p>
            <small>{new Date(msg.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div className='chat-input'>
        <input
          type='text'
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Balas pesan...'
        />
        <button className='button' onClick={handleSend}>Kirim</button>
      </div>
    </div>
  );
}
