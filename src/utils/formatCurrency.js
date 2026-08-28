export default function formatCurrency(number){
  const numericValue = typeof number === 'number' ? number : Number(number);
  const safeValue = Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
  return 'Rp ' + safeValue.toLocaleString('id-ID');
}
