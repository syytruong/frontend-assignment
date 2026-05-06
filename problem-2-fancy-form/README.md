# Fancy Form — Currency Swap


## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

## What's in scope

The brief asks for a swap form and grants generous latitude. I built the
core form to a high standard and added four "real DEX" features:

| Feature | Why |
|---|---|
| **Bidirectional inputs** | Type into either side; the other recomputes from the rate. The user picks "I'll spend X" or "I want exactly Y" — both are valid intents. |
| **Direction flip** | Single click swaps the from/to tokens *and* preserves the user's typed value (whichever side they last edited keeps driving the calc). |
| **MAX button** | One-tap fill of the user's full balance, the standard DEX shortcut. |
| **Slippage tolerance** | 0.1 / 0.5 / 1.0 % presets + custom field. Threaded into the swap math (not just UI decoration). |
| **Recent swaps** | localStorage-backed, cross-tab synced, capped at 5 entries. |
| **Token search** | Modal picker with text filter; the "other side's" token is disabled to prevent self-swaps. |

## Architecture

```
src/
├── main.tsx               Vite entry — ThemeProvider + QueryClient + StrictMode
├── App.tsx                Layout shell
├── theme.ts               MUI theme (clean fintech, light mode)
│
├── api/prices.ts          fetch() the upstream feed
│
├── domain/                Pure TS, no React, no MUI — unit-testable
│   ├── types.ts           Token, RawPriceEntry, SwapRecord, SwapDirection
│   ├── tokens.ts          buildTokenList — dedupes the messy upstream feed
│   └── swap.ts            computeOutputAmount, computeInputAmount, computeRate
│
├── hooks/
│   ├── usePrices.ts       React Query wrapper around fetch + dedup
│   └── useRecentSwaps.ts  localStorage-backed history with cross-tab sync
│
└── components/
    ├── SwapCard.tsx           Form orchestrator — owns state, coordinates children
    ├── TokenAmountInput.tsx   Token chip + amount field (used twice)
    ├── TokenPicker.tsx        Modal token list with search
    ├── TokenIcon.tsx          <img> with letter-fallback Avatar
    ├── SwapDirectionButton.tsx The flip button between the two inputs
    ├── SettingsMenu.tsx       Slippage tolerance popover
    └── RecentSwaps.tsx        History panel
```

The dependency graph points one way: **components → hooks → domain → api**.
Domain has zero React, so the swap math is testable with plain `expect()`.

## Notable design decisions

### State model: one source of truth, derive the rest

A naive implementation stores `fromAmount` and `toAmount` separately and
syncs them with a `useEffect`. That's the React docs' first example of
[an effect you don't need](https://react.dev/learn/you-might-not-need-an-effect) —
it flickers, double-renders, and races itself.

This version stores **only what the user typed** (`typedAmount`) plus
**which side they typed on** (`direction`). The opposite side is computed
during render via `useMemo`. No effect, no sync, no race.

```tsx
// One state, two views
const { fromAmount, toAmount } = useMemo(() => {
  if (direction === 'fromInput') {
    const out = computeOutputAmount(parseFloat(typedAmount), fromToken, toToken, slippageBps);
    return { fromAmount: typedAmount, toAmount: formatAmount(out) };
  }
  const inAmt = computeInputAmount(parseFloat(typedAmount), fromToken, toToken, slippageBps);
  return { fromAmount: formatAmount(inAmt), toAmount: typedAmount };
}, [typedAmount, direction, fromToken, toToken, slippageBps]);
```

### Upstream data is messy — domain layer cleans it

The price feed has duplicates: `USDC` appears 4 times with slightly
different prices. `buildTokenList()` dedupes by keeping the entry with the
latest `date` per symbol, drops anything with a non-positive price, and
returns a sorted list. The component never sees the mess.

### Validation is derived, not stored

The error message is computed from current state every render. There's no
"validation result" in state that could go stale. As soon as the user
fixes their input, the error disappears — no manual revalidation needed.

### Token icons: fail gracefully

`STEVMOS`, `ampLUNA`, and a few others don't have icons in the Switcheo
repo. Rather than show a broken image, `TokenIcon.tsx` renders a colored
Avatar with the symbol's first letter on `onError`. The hue is derived
from the symbol so the same token gets the same color every session.

### Mocked submit

Per the brief's hint, the submit button shows a 1.5s loading state and
records to localStorage. A real swap would replace that timeout with an
RPC call; nothing else changes.

## What I deliberately *did not* do

- **Wallet integration** — the brief explicitly allows mocking. I use
  a small `MOCK_BALANCES` map for ETH/USDC/WBTC/SWTH so the MAX button
  has something to do.
- **Unit tests** — the domain layer (`swap.ts`, `tokens.ts`) is structured
  to be trivially testable, but I prioritized the UI given the time
  budget. Adding a Vitest suite would be straightforward.
- **Internationalization** — `Number.toLocaleString` respects the
  browser's locale, but I haven't added i18n for English copy.
- **Token decimals** — real DEXs cap input precision per token. I cap at
  6 fractional digits universally, which is fine for indicative quotes
  but would need per-token rules for actual on-chain swaps.

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite** | Fast dev server; per the brief's bonus. |
| UI lib | **MUI v5** | Best polish out of the box for "professional fintech." |
| State (server) | **TanStack Query** | Loading/error/cache for free; no useEffect+fetch+useState. |
| State (client) | **useState + useMemo** | Form is small enough that Redux/Zustand would be overkill. |
| Type safety | **TS strict** + `noUncheckedIndexedAccess` | Catches the kind of bugs that produce "NaN" in a wallet UI. |
