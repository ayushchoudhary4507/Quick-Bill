/**
 * Format a numeric price for display (INR — ₹).
 */

export function formatCurrency(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(n)
}
