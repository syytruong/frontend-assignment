interface WalletBalance {
  currency: string;
  amount: number;
// ERROR: missing `blockchain` field — the code below reads `balance.blockchain` - line 40
}
interface FormattedWalletBalance { // ERROR: duplicate WalletBalance interface
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps { // ERROR: empty interface that adds nothing. Either delete it and use BoxProps

}
const WalletPage: React.FC<Props> = (props: Props) => {  // ERROR: `: Props` after `props` is redundant — React.FC<Props> already types it.
  const { children, ...rest } = props;  // ERROR: `children` is destructured but never used anywhere in the component.
  const balances = useWalletBalances();
  const prices = usePrices();

    // ERROR: this function is redeclared on every render. It has no closure
	const getPriority = (blockchain: any): number => { // ERROR: should avoid type any.

    // ERROR: a switch over string constants is OCP-unfriendly — adding a new chain
    // means editing the component.
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain); // ERROR: `balancePriority` is computed and never used.
		  if (lhsPriority > -99) { // ERROR: `lhsPriority` is not defined anywhere — ReferenceError at runtime.
		     if (balance.amount <= 0) { // ERROR: filter is INVERTED. This keeps balances with amount <= 0 (zero or negative)
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  } 
      // ERROR: missing `return 0` for the equal case. 
      // The function implicitly returns `undefined` when rightPriority === leftPriority, 
      // which is not a valid return value for a sort comparator and will cause incorrect sorting.
    });
  }, [balances, prices]); // ERROR: `prices` is in the dependency array but is never read inside the memo.


  // ERROR: `formattedBalances` is computed but NEVER USED. The `rows` map below
  // iterates `sortedBalances` instead. This is dead work every render.
  // also not memoized — even if it were used, it would recompute on every render.
  
  // ERROR: three sequential passes over the same data — filter+sort, then
  // format, then JSX. Format can be folded into the filter+sort pipeline.
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  // ERROR: type cast lies. `sortedBalances` contains `WalletBalance`, this should be `formattedBalances`
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // NOTE: from here, assume that we are using `formattedBalances` instead of `sortedBalances` as param

    // ERROR: if `prices[balance.currency]` is undefined (still loading, or unknown
    // currency), this evaluates to `NaN` and renders as "NaN" in the UI.
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}  // ERROR: `key={index}` on a sortable/filterable list is the textbook React anti-pattern
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}