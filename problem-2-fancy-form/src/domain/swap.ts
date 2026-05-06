import type { Token } from './types';

/** USD-denominated rate: 1 unit of `from` = N units of `to`. */
export function computeRate(from: Token, to: Token): number {
  if (to.priceUsd === 0) return 0;
  return from.priceUsd / to.priceUsd;
}

export function computeOutputAmount(
  fromAmount: number,
  from: Token,
  to: Token,
  slippageBps = 0,
): number {
  if (!Number.isFinite(fromAmount) || fromAmount <= 0) return 0;
  const rate = computeRate(from, to);
  const gross = fromAmount * rate;
  const haircut = (gross * slippageBps) / 10_000;
  return gross - haircut;
}

export function computeInputAmount(
  toAmount: number,
  from: Token,
  to: Token,
  slippageBps = 0,
): number {
  if (!Number.isFinite(toAmount) || toAmount <= 0) return 0;
  const rate = computeRate(from, to);
  if (rate === 0) return 0;
  // Reverse the haircut so a user typing "I want exactly N USDC" works.
  const grossTo = toAmount / (1 - slippageBps / 10_000);
  return grossTo / rate;
}
