import { useParams } from 'react-router-dom';
import { findSeller } from '../../data/dummyData';
import SEO from '../../components/seo/SEO';
import { APP_URL } from '../../config/seoConfig';

export default function SellerProfile(){
  const { slug } = useParams();
  const seller = findSeller(slug);
  if (!seller) return <div className='container'><div className='card'><h1>Seller tidak ditemukan</h1></div></div>;

  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: seller.name,
    description: seller.bio,
    url: `${APP_URL}/seller/${slug}`,
    aggregateRating: seller.rating ? {
      '@type': 'AggregateRating',
      ratingValue: seller.rating,
      reviewCount: seller.sales || 1,
    } : undefined,
  };

  return (
    <div className='container'>
      <SEO
        title={`${seller.name} - Toko Seller di GHub`}
        description={seller.bio || `Beli produk game dari ${seller.name} di GHub.`}
        keywords={`${seller.name}, toko game, seller game, GHub`}
        canonical={`/seller/${slug}`}
        type="website"
        jsonLd={[storeSchema]}
      />
      <h1>{seller.name}</h1>
      <div className='card'>
        <p>{seller.bio}</p>
        <p>Rating: {seller.rating}</p>
        <p>Sales: {seller.sales}</p>
      </div>
    </div>
  );
}
