// Filters, sorts and paginates the products array according to params
export function filterAndSortProducts(products, options){
  const {
    q,
    category,
    game,
    priceMin,
    priceMax,
    seller,
    delivery,
    sort,
    page = 1,
    perPage = 12
  } = options || {};

  let out = products.slice();
  if (q) {
    const qq = q.toLowerCase();
    out = out.filter(p => (p.title + ' ' + p.description + ' ' + p.sellerName + ' ' + p.game).toLowerCase().includes(qq));
  }
  if (category && category !== 'all'){
    out = out.filter(p => p.category === category);
  }
  if (game && game !== 'all'){
    out = out.filter(p => p.gameSlug === game);
  }
  if (priceMin !== undefined && priceMin !== null && priceMin !== ''){
    out = out.filter(p => p.price >= Number(priceMin));
  }
  if (priceMax !== undefined && priceMax !== null && priceMax !== ''){
    out = out.filter(p => p.price <= Number(priceMax));
  }
  if (seller){
    if (seller === 'verified') out = out.filter(p => p.sellerVerified);
    if (seller === 'top') out = out.filter(p => p.totalSales >= 1000);
  }
  if (delivery && delivery !== 'all'){
    out = out.filter(p => p.deliveryType === delivery);
  }

  // sorting
  if (sort){
    if (sort === 'new') out.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'price-low') out.sort((a,b)=> a.price - b.price);
    if (sort === 'price-high') out.sort((a,b)=> b.price - a.price);
    if (sort === 'rating') out.sort((a,b)=> b.rating - a.rating);
    if (sort === 'sales') out.sort((a,b)=> b.totalSales - a.totalSales);
  }

  const total = out.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paged = out.slice(start, end);
  return { total, results: paged };
}
