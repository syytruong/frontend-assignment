// Domain model. Plain TS, no React, no MUI. Reusable by any view.

export interface RawPriceEntry {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  priceUsd: number;
  priceAt: string;
}

export interface SwapRecord {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  submittedAt: string;
}

export type SwapDirection = 'fromInput' | 'toInput';
