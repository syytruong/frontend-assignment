// NOTE: assume we have useWalletBalances, usePrices, type BoxProps and <WalletRow /> somewhere

import { useMemo, type FC } from 'react';
import { prepareBalances } from './prepareBalances';
import type { FormattedWalletBalance, PriceMap } from './types';

type Props = BoxProps;

const computeUsdValue = (
  balance: FormattedWalletBalance,
  prices: PriceMap,
): number => {
  const price = prices[balance.currency];
  return price === undefined ? 0 : price * balance.amount;
};

export const WalletPage: FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const rows = useMemo(() => prepareBalances(balances), [balances]);

  return (
    <div {...props}>
      {rows.map((balance) => (
        <WalletRow
          key={balance.currency}
          className={classes.row}
          amount={balance.amount}
          usdValue={computeUsdValue(balance, prices)}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};