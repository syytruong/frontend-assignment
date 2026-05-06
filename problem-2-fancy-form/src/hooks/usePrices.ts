import { useQuery } from '@tanstack/react-query';
import { fetchPrices } from '../api/prices';
import { buildTokenList } from '../domain/tokens';
import type { Token } from '../domain/types';

export function useTokens() {
  return useQuery<Token[]>({
    queryKey: ['prices'],
    queryFn: async () => buildTokenList(await fetchPrices()),
    staleTime: 60_000, // prices update slowly; one minute is fine
  });
}
