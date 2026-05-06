import type { Blockchain } from './types';

const PRIORITY_BY_BLOCKCHAIN: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const UNKNOWN_PRIORITY = -99;

export function getPriority(blockchain: string): number {
  return PRIORITY_BY_BLOCKCHAIN[blockchain as Blockchain] ?? UNKNOWN_PRIORITY;
}

export function isKnownChain(blockchain: string): boolean {
  return getPriority(blockchain) > UNKNOWN_PRIORITY;
}