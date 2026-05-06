# Wallet Page Refactor

## TL;DR

The original code had **15+ issues** across four categories — runtime crashes,
type-safety holes, React anti-patterns, and SOLID violations. The refactor
splits a 60-line component into four small files so each piece does one job.

```
WalletPage.tsx           60 lines, 6 responsibilities
                            │
                            ▼
types.ts                 domain shapes
priority.ts              chain ranking (data, not switch)
prepareBalances.ts       filter → sort → format pipeline
WalletPage.tsx           ~25 lines, just renders
```

---

## Files

| File | Purpose | Depends on |
|---|---|---|
| `./original/WalletPage.tsx` | Original code, kept for diff comparison | — |
| `./refactored/types.ts` | `Blockchain`, `WalletBalance`, `FormattedWalletBalance`, `PriceMap` | nothing |
| `./refactored/priority.ts` | `getPriority`, `isKnownChain` | `types.ts` |
| `./refactored/prepareBalances.ts` | Pure pipeline (filter → sort → format) | `types.ts`, `priority.ts` |
| `./refactored/WalletPage-improved.tsx` | React component | all of the above + hooks |

The dependency graph is a DAG pointing inward: domain has no React, the
component depends on domain (not the other way around).

---

### 🔴 Correctness — the original code did not run

| # | Problem | Fix |
|---|---|---|
| 1 | `lhsPriority` referenced but never declared (`ReferenceError`) | Removed; filter now reads `isKnownChain(b.blockchain)` |
| 2 | Filter kept `amount <= 0` (zero/negative balances) | Now keeps `amount > 0` |
| 3 | Sort comparator returned `undefined` for equal priorities | `getPriority(b) - getPriority(a)` always returns a number |
| 4 | `rows` iterated `sortedBalances` but expected `formatted` field | Pipeline returns `FormattedWalletBalance[]`; rows iterate that |
| 5 | `WalletBalance` had no `blockchain` field | Added with typed `Blockchain` union |

### 🟠 Type safety

| # | Problem | Fix |
|---|---|---|
| 6 | `blockchain: any` | `Blockchain` string-literal union |
| 7 | Empty `interface Props extends BoxProps {}` | `type Props = BoxProps` |
| 8 | `as FormattedWalletBalance` cast was a lie | Types flow correctly from pipeline |
| 9 | `prices[currency] * amount` → `NaN` if missing | `computeUsdValue` falls back to 0 |

### 🟡 React / performance

| # | Problem | Fix |
|---|---|---|
| 10 | `useMemo` deps included `prices` (never read inside) | Deps: `[balances]` only |
| 11 | `formattedBalances` computed every render, never used | Folded into the memoized pipeline |
| 12 | `getPriority` redeclared on every render | Hoisted to `priority.ts` (module scope) |
| 13 | `key={index}` on a sortable list | `key={balance.currency}` (stable identity) |
| 14 | Three sequential array passes | One pipeline (filter → sort → format) |

### 🟢 Design / SOLID

| # | Problem | Fix |
|---|---|---|
| 15 | Component owned priority logic + filtering + sorting + formatting + rendering | Split across 3 files; component only orchestrates |
| 16 | `switch` over chain names → adding a chain edits the component | `Record<Blockchain, number>` lookup → adding a chain edits data |
| 17 | `FormattedWalletBalance` duplicated `WalletBalance` | `FormattedWalletBalance extends WalletBalance` |

---

## Before / after

### Before (excerpt)

```tsx
const sortedBalances = useMemo(() => {
  return balances.filter((balance: WalletBalance) => {
    const balancePriority = getPriority(balance.blockchain);
    if (lhsPriority > -99) {              // 💥 ReferenceError
      if (balance.amount <= 0) {           // 💥 inverted
        return true;
      }
    }
    return false;
  }).sort((lhs, rhs) => {
    const leftPriority = getPriority(lhs.blockchain);
    const rightPriority = getPriority(rhs.blockchain);
    if (leftPriority > rightPriority) return -1;
    else if (rightPriority > leftPriority) return 1;
                                            // 💥 missing return 0
  });
}, [balances, prices]);                     // 💥 prices unused → memo defeated

const formattedBalances = sortedBalances.map(/* ... */); // 💥 never used

const rows = sortedBalances.map((balance: FormattedWalletBalance, index) => {
  const usdValue = prices[balance.currency] * balance.amount; // 💥 NaN risk
  return <WalletRow key={index} /* ... */ />;                 // 💥 index key
});
```

### After

```tsx
// prepareBalances.ts — pure, no React
export function prepareBalances(
  balances: readonly WalletBalance[],
): FormattedWalletBalance[] {
  return balances
    .filter((b) => isKnownChain(b.blockchain) && b.amount > 0)
    .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
    .map((b) => ({ ...b, formatted: b.amount.toFixed() }));
}

// WalletPage.tsx — just orchestrates
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
```

## How to extend

### Add a new blockchain

1. Add to the union in `types.ts`:
   ```ts
   export type Blockchain = 'Osmosis' | 'Ethereum' | /* ... */ | 'Solana';
   ```
2. TypeScript will now error on `PRIORITY_BY_BLOCKCHAIN` in `priority.ts`
   until you add it:
   ```ts
   const PRIORITY_BY_BLOCKCHAIN: Record<Blockchain, number> = {
     /* ... */
     Solana: 40,
   };
   ```
3. Done. No component changes, no test changes (unless you want to add one).

### Change the filter rule

`prepareBalances.ts` is a pure function — change the predicate, write a unit
test, ship.

```ts
.filter((b) => isKnownChain(b.blockchain) && b.amount > 0)
//                                           ^^^^^^^^^^^^^ change here
```

### Change how amounts are formatted

`formatAmount` is a private helper in `prepareBalances.ts`. Swap to
`Intl.NumberFormat`, locale-aware formatting, etc. without touching React.

### Render a different layout

Replace `WalletPage.tsx` with a table, a chart, a CSV export — the domain
modules don't care. They return data; the view picks how to display it.

---

## Trade-offs and judgment calls

A few things I deliberately did **not** change, with rationale:

- **Direct hook usage in `WalletPage`.** Could be inverted (page receives
  `balances` and `prices` as props from a container). Adds a layer; not
  worth it for a page-level component unless tests demand it.
- **No `React.memo` on `WalletRow`.** The cost-benefit depends on how heavy
  the row is and how often the parent re-renders. Add it the moment a real
  performance need shows up — not before.
- **No virtualization.** A wallet typically has < 50 rows. If the product
  needs hundreds, swap the `.map` for `react-window` or similar. The domain
  layer doesn't change.
- **`computeUsdValue` falls back to 0 for missing prices.** Some products
  prefer to hide the row until the price loads. One-line change in the
  component if needed.

---

## Running it

This refactor is intended to slot into the original host app. The four
files are framework-agnostic:

- `types.ts` — pure TS, zero deps.
- `priority.ts` — pure TS, depends on `types.ts`.
- `prepareBalances.ts` — pure TS, depends on `types.ts` + `priority.ts`.
- `WalletPage.tsx` — React, depends on the host's `useWalletBalances`,
  `usePrices`, `WalletRow`, `BoxProps`, and `classes`.

To run in isolation, point the imports at stubs and add Vite + Vitest. The
domain files have no React, so they're testable with a plain `expect()`.