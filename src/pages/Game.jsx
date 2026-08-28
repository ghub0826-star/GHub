import { useParams } from 'react-router-dom';
import { findGame } from '../data/dummyData';

export default function Game(){
  const { slug } = useParams();
  const game = findGame(slug);
  if (!game) return <div className='container'><div className='card'><h1>Game tidak ditemukan</h1></div></div>;
  return (
    <div className='container'>
      <h1>{game.title}</h1>
      <p>{game.description}</p>
      <div className='card'>
        <p>{game.subtitle}</p>
        <p>Produk: {game.products}</p>
      </div>
    </div>
  );
}
