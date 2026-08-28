import api from './api';

// Exchange rates (multi-currency) admin service
export const fetchExchangeRates = () => api.get('/enterprise/admin/exchange-rates');
export const setExchangeRate = (currency, rate, manualOverride) =>
  api.post('/enterprise/admin/exchange-rates', { currency, rate, manualOverride });

// Format a number in a given currency code using tenant default
export const formatCurrency = (amount, currency = 'IDR') => {
  const num = Number(amount) || 0;
  const symbols = { IDR: 'Rp', USD: '$', SGD: 'S$', MYR: 'RM', THB: '฿', JPY: '¥', EUR: '€' };
  const sym = symbols[currency] || currency + ' ';
  return sym + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export default { fetchExchangeRates, setExchangeRate, formatCurrency };
