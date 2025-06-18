// src/utils/formatCurrency.js
export function formatCurrency(amountUSD, exchangeRate, currencyCode) {
  const converted = amountUSD * exchangeRate;
  const number = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(converted);

  return `${currencyCode || 'USD'} ${number}`;
}