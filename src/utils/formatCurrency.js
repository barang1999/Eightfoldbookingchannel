// src/utils/formatCurrency.js
export function formatCurrency(amountUSD, exchangeRate, currencyCode) {
  const converted = amountUSD * exchangeRate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits: 2
  }).format(converted);
}