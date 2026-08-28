import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { findProduct } from '../../data/dummyData';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        if (mounted) setProduct(res.data);
      } catch (err) {
        // fallback to dummy
        const found = findProduct(slug);
        if (found && mounted) setProduct(found);
      }
      try {
        const r = await api.get(`/reviews/${slug}`);
        if (mounted) setReviews(r.data);
      } catch (e) {
        if (mounted) setReviews([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [slug]);

  const handleBuy = () => {
    if (product) {
      navigate('/checkout', { state: { product } });
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) return;
    const payload = {
      order_id: 1,
      buyer_id: 1,
      seller_id: product.seller_id,
      rating,
      comment,
    };
    const response = await api.post(`/reviews/${id}`, payload);
    setReviews((prev) => [...prev, response.data]);
    setComment('');
    setRating(5);
  };

  if (!product) {
    return <div className='container'><p>Loading...</p></div>;
  }

  return (
    <div className='container'>
      <h1>{product.title}</h1>
      <div className='card'>
        <p>{product.description}</p>
        <p>Harga: Rp {product.price.toLocaleString()}</p>
        <p>Stok: {product.stock}</p>
        <p>Delivery: {product.delivery_time}</p>
        <p>Rating: {product.rating} ({product.reviews_count} ulasan)</p>
        <button className='button' onClick={handleBuy}>Buy Now</button>
      </div>

      <div className='card' style={{ marginTop: '1rem' }}>
        <h2>Reviews</h2>
        {reviews.length === 0 && <p>Belum ada ulasan untuk produk ini.</p>}
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <strong>{review.rating} ⭐</strong> — {review.comment}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '1rem' }}>
          <h3>Tulis Ulasan</h3>
          <label>Rating</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <label>Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
          <button className='button' onClick={handleSubmitReview}>Kirim Ulasan</button>
        </div>
      </div>
    </div>
  );
}
