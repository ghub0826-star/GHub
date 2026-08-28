import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Messages(){
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const seller = params.get('seller');
  return (
    <div className='container'>
      <h1>Messages</h1>
      <div className='card'>
        <p>Placeholder chat page. Start conversation with seller: {seller}</p>
      </div>
    </div>
  );
}
