import { filterAndSortProducts } from '../../utils/filterProducts';
import productsData from '../../data/products';

describe('filterAndSortProducts', () => {
  const sampleProducts = [
    {
      id: 1,
      slug: 'mlbb-account-mythic-1',
      title: 'Akun Mobile Legends Rank Mythic',
      description: 'Akun MLBB rank Mythic lengkap dengan skin utama.',
      game: 'Mobile Legends',
      gameSlug: 'mobile-legends',
      category: 'accounts',
      price: 450000,
      rating: 4.9,
      reviewCount: 1250,
      sellerName: 'Pro Gamer Store',
      sellerVerified: true,
      totalSales: 12500,
      deliveryType: 'instant',
      deliveryTime: '2-5 menit',
      createdAt: '2026-06-10',
    },
    {
      id: 2,
      slug: 'ff-diamond-500',
      title: 'Diamond Free Fire 500',
      description: 'Top up diamond FF 500.',
      game: 'Free Fire',
      gameSlug: 'free-fire',
      category: 'top-up',
      price: 25000,
      rating: 4.8,
      reviewCount: 430,
      sellerName: 'GG Best Store',
      sellerVerified: true,
      totalSales: 4300,
      deliveryType: 'instant',
      deliveryTime: '1 menit',
      createdAt: '2026-07-02',
    },
    {
      id: 3,
      slug: 'pubg-boost-rank',
      title: 'Boost Rank PUBG Mobile',
      description: 'Jasa boosting rank PUBG Mobile.',
      game: 'PUBG Mobile',
      gameSlug: 'pubg-mobile',
      category: 'boosting',
      price: 150000,
      rating: 4.7,
      reviewCount: 1595,
      sellerName: 'BoostKing',
      sellerVerified: false,
      totalSales: 3200,
      deliveryType: 'manual',
      deliveryTime: '1-3 hari',
      createdAt: '2026-05-18',
    },
  ];

  describe('search filter', () => {
    it('should filter products by search query', () => {
      const result = filterAndSortProducts(sampleProducts, { q: 'mobile' });
      expect(result.total).toBe(2);
      expect(result.results[0].title).toBe('Akun Mobile Legends Rank Mythic');
    });

    it('should be case-insensitive', () => {
      const result = filterAndSortProducts(sampleProducts, { q: 'DIAMOND' });
      expect(result.total).toBe(1);
      expect(result.results[0].title).toContain('Diamond');
    });

    it('should return all products when no query', () => {
      const result = filterAndSortProducts(sampleProducts, {});
      expect(result.total).toBe(3);
    });
  });

  describe('category filter', () => {
    it('should filter by category', () => {
      const result = filterAndSortProducts(sampleProducts, { category: 'boosting' });
      expect(result.total).toBe(1);
      expect(result.results[0].category).toBe('boosting');
    });

    it('should return all when category is "all"', () => {
      const result = filterAndSortProducts(sampleProducts, { category: 'all' });
      expect(result.total).toBe(3);
    });
  });

  describe('game filter', () => {
    it('should filter by gameSlug', () => {
      const result = filterAndSortProducts(sampleProducts, { game: 'mobile-legends' });
      expect(result.total).toBe(1);
      expect(result.results[0].gameSlug).toBe('mobile-legends');
    });
  });

  describe('price filter', () => {
    it('should filter by min price', () => {
      const result = filterAndSortProducts(sampleProducts, { priceMin: 100000 });
      expect(result.total).toBe(2);
      expect(result.results.every((p) => p.price >= 100000)).toBe(true);
    });

    it('should filter by max price', () => {
      const result = filterAndSortProducts(sampleProducts, { priceMax: 50000 });
      expect(result.total).toBe(1);
      expect(result.results[0].price).toBe(25000);
    });
  });

  describe('seller filter', () => {
    it('should filter for verified sellers', () => {
      const result = filterAndSortProducts(sampleProducts, { seller: 'verified' });
      expect(result.total).toBe(2);
      expect(result.results.every((p) => p.sellerVerified)).toBe(true);
    });
  });

  describe('delivery filter', () => {
    it('should filter by delivery type', () => {
      const result = filterAndSortProducts(sampleProducts, { delivery: 'manual' });
      expect(result.total).toBe(1);
      expect(result.results[0].deliveryType).toBe('manual');
    });
  });

  describe('sorting', () => {
    it('should sort by price low to high', () => {
      const result = filterAndSortProducts(sampleProducts, { sort: 'price-low' });
      expect(result.results[0].price).toBe(25000);
      expect(result.results[1].price).toBe(150000);
      expect(result.results[2].price).toBe(450000);
    });

    it('should sort by price high to low', () => {
      const result = filterAndSortProducts(sampleProducts, { sort: 'price-high' });
      expect(result.results[0].price).toBe(450000);
      expect(result.results[2].price).toBe(25000);
    });

    it('should sort by rating', () => {
      const result = filterAndSortProducts(sampleProducts, { sort: 'rating' });
      expect(result.results[0].rating).toBe(4.9);
      expect(result.results[2].rating).toBe(4.7);
    });

    it('should sort by sales', () => {
      const result = filterAndSortProducts(sampleProducts, { sort: 'sales' });
      expect(result.results[0].totalSales).toBe(12500);
      expect(result.results[2].totalSales).toBe(3200);
    });

    it('should sort by newest', () => {
      const result = filterAndSortProducts(sampleProducts, { sort: 'new' });
      expect(result.results[0].createdAt).toBe('2026-07-02');
    });
  });

  describe('pagination', () => {
    it('should paginate results', () => {
      const result = filterAndSortProducts(sampleProducts, { page: 1, perPage: 2 });
      expect(result.results.length).toBe(2);
      expect(result.total).toBe(3);
    });

    it('should handle page 2', () => {
      const result = filterAndSortProducts(sampleProducts, { page: 2, perPage: 2 });
      expect(result.results.length).toBe(1);
      expect(result.total).toBe(3);
    });

    it('should default to perPage=12', () => {
      const result = filterAndSortProducts(sampleProducts, { page: 1 });
      expect(result.results.length).toBe(3);
    });
  });

  describe('real data', () => {
    it('should work with the full product dataset', () => {
      const result = filterAndSortProducts(productsData, { category: 'accounts' });
      expect(result.total).toBeGreaterThan(0);
    });
  });
});
