import type { RawPriceEntry, Token } from './types';

/**
 * Tokens with no price are silently dropped per the brief:
 * "those that do not [have a price] can be omitted."
 */
export function buildTokenList(raw: readonly RawPriceEntry[]): Token[] {
  const latestBySymbol = new Map<string, RawPriceEntry>();
 
  for (const entry of raw) {
    if (typeof entry.price !== 'number' || entry.price <= 0) continue;
 
    const existing = latestBySymbol.get(entry.currency);
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latestBySymbol.set(entry.currency, entry);
    }
  }
 
  return Array.from(latestBySymbol.values())
    .map(
      (e): Token => ({
        symbol: e.currency,
        priceUsd: e.price,
        priceAt: e.date,
      }),
    )
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
