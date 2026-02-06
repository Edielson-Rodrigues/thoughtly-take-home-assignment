/**
 * Generate a unique idempotency key for booking requests
 * Uses crypto.randomUUID() for standard UUID v4 generation
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Format a number as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
