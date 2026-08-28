export const dummyCategories = [
  { label: 'Semua Game', value: 'all', slug: 'all', icon: 'fa-gamepad' },
  { label: 'Akun Game', value: 'accounts', slug: 'accounts', icon: 'fa-user' },
  { label: 'Item Game', value: 'items', slug: 'items', icon: 'fa-swords' },
  { label: 'Top Up', value: 'top-up', slug: 'top-up', icon: 'fa-gem' },
  { label: 'Game Currency', value: 'currency', slug: 'currency', icon: 'fa-coins' },
  { label: 'Boosting', value: 'boosting', slug: 'boosting', icon: 'fa-rocket' },
  { label: 'Gift Card', value: 'gift-card', slug: 'gift-card', icon: 'fa-gift' },
];

export const dummyGames = [
  {
    slug: 'mobile-legends',
    title: 'Mobile Legends',
    subtitle: 'MOBA terpopuler Indonesia',
    description: 'Gameplay cepat dengan hero unik dan turnamen kompetitif.',
    products: 4500,
  },
  {
    slug: 'free-fire',
    title: 'Free Fire',
    subtitle: 'Battle royale 4v4 yang seru',
    description: 'Top-up diamond, akun rank tinggi, dan item eksklusif.',
    products: 3716,
  },
  {
    slug: 'pubg-mobile',
    title: 'PUBG Mobile',
    subtitle: 'Survival shooter dengan item premium',
    description: 'Boost rank, item bundle, dan akun elite terbaik.',
    products: 3495,
  },
];

export const dummySellers = [
  {
    slug: 'pro-gamer-store',
    name: 'Pro Gamer Store',
    rating: 5.0,
    sales: '12.500+',
    bio: 'Seller terpercaya dengan layanan cepat dan support 24/7.',
    verified: true,
    products: 84,
  },
  {
    slug: 'gg-best-store',
    name: 'GG Best Store',
    rating: 4.9,
    sales: '4.300+',
    bio: 'Akun dan item game premium dengan garansi aman.',
    verified: true,
    products: 52,
  },
];

export const dummyProducts = [
  {
    id: 1,
    slug: 'akun-mobile-legends-rank-mythic',
    title: 'Akun Mobile Legends Rank Mythic',
    description: 'Akun ML dengan rank Mythic siap dimainkan.',
    price: 450000,
    stock: 12,
    delivery: 'Instan',
    rating: 4.9,
    reviews: 1250,
    category: 'accounts',
    type: 'game',
    tags: ['ml', 'account'],
    seller: { name: 'Pro Gamer Store', verified: true },
    seller_id: 1,
    image: '/assets/product-1.jpg',
  },
  {
    id: 2,
    slug: 'diamond-free-fire-500',
    title: 'Diamond Free Fire 500',
    description: 'Top up Diamond Free Fire cepat dan aman.',
    price: 25000,
    stock: 82,
    delivery: 'Instan',
    rating: 4.8,
    reviews: 1250,
    category: 'top-up',
    type: 'currency',
    tags: ['ff', 'diamonds'],
    seller: { name: 'GG Best Store', verified: true },
    seller_id: 2,
    image: '/assets/product-2.jpg',
  },
  {
    id: 3,
    slug: 'boost-rank-pubg-mobile',
    title: 'Boost Rank PUBG Mobile',
    description: 'Layanan boosting rank cepat untuk PUBG Mobile.',
    price: 150000,
    stock: 20,
    delivery: '1 jam',
    rating: 4.7,
    reviews: 950,
    category: 'boosting',
    type: 'game',
    tags: ['pubg', 'boost'],
    seller: { name: 'Pro Gamer Store', verified: true },
    seller_id: 1,
    image: '/assets/product-3.jpg',
  },
];

export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function findProduct(slug) {
  if (!slug) return null;
  return dummyProducts.find((product) => product.slug === slug || String(product.id) === slug);
}

export function findGame(slug) {
  return dummyGames.find((game) => game.slug === slug);
}

export function findSeller(slug) {
  return dummySellers.find((seller) => seller.slug === slug);
}
