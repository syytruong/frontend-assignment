import type { FormattedWalletBalance, WalletBalance } from './types';
import { getPriority, isKnownChain } from './priority';

const formatAmount = (amount: number): string => amount.toFixed();

export function prepareBalances(
  balances: readonly WalletBalance[],
): FormattedWalletBalance[] {
  return balances
    .filter((b) => isKnownChain(b.blockchain) && b.amount > 0)
    .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
    .map((b) => ({ ...b, formatted: formatAmount(b.amount) }));
}