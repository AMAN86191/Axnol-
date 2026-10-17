export const formatPrice = (value: number): string =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;

export const formatPriceParts = (
  value: number,
): {symbol: string; amount: string} => ({
  symbol: '₹',
  amount: Math.round(value).toLocaleString('en-IN'),
});
