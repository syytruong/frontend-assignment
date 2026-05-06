export type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo';

export interface WalletBalance {
  currency: string;
  blockchain: Blockchain;
  amount: number;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

export type PriceMap = Readonly<Record<string, number>>;