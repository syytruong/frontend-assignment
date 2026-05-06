import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Snackbar,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { TokenAmountInput } from './TokenAmountInput';
import { TokenPicker } from './TokenPicker';
import { SwapDirectionButton } from './SwapDirectionButton';
import { SettingsMenu } from './SettingsMenu';
import { useTokens } from '../hooks/usePrices';
import { useRecentSwaps } from '../hooks/useRecentSwaps';
import {
  computeInputAmount,
  computeOutputAmount,
  computeRate,
} from '../domain/swap';
import type { SwapDirection } from '../domain/types';

const DEFAULT_FROM = 'ETH';
const DEFAULT_TO = 'USDC';
const MOCK_BALANCES: Record<string, number> = {
  ETH: 1.5,
  USDC: 2500,
  WBTC: 0.05,
  SWTH: 10000,
};

export function SwapCard() {
  const tokensQuery = useTokens();
  const tokens = tokensQuery.data ?? [];
  const { add: addRecent } = useRecentSwaps();

  const [fromSymbol, setFromSymbol] = useState<string | null>(null);
  const [toSymbol, setToSymbol] = useState<string | null>(null);

  const [typedAmount, setTypedAmount] = useState('');
  const [direction, setDirection] = useState<SwapDirection>('fromInput');

  const [pickerOpenFor, setPickerOpenFor] = useState<
    'from' | 'to' | null
  >(null);
  const [slippageBps, setSlippageBps] = useState(50); // 0.5 % default
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  // Pick sensible defaults once the token list loads.
  useEffect(() => {
    if (!tokens.length) return;
    if (!fromSymbol) {
      setFromSymbol(
        tokens.find((t) => t.symbol === DEFAULT_FROM)?.symbol ??
          tokens[0]?.symbol ??
          null,
      );
    }
    if (!toSymbol) {
      setToSymbol(
        tokens.find((t) => t.symbol === DEFAULT_TO)?.symbol ??
          tokens[1]?.symbol ??
          null,
      );
    }
  }, [tokens, fromSymbol, toSymbol]);

  const fromToken = useMemo(
    () => tokens.find((t) => t.symbol === fromSymbol) ?? null,
    [tokens, fromSymbol],
  );
  const toToken = useMemo(
    () => tokens.find((t) => t.symbol === toSymbol) ?? null,
    [tokens, toSymbol],
  );

  const { fromAmount, toAmount } = useMemo(() => {
    if (!fromToken || !toToken) {
      return direction === 'fromInput'
        ? { fromAmount: typedAmount, toAmount: '' }
        : { fromAmount: '', toAmount: typedAmount };
    }
    const n = parseFloat(typedAmount);
    if (!Number.isFinite(n) || n <= 0) {
      return direction === 'fromInput'
        ? { fromAmount: typedAmount, toAmount: '' }
        : { fromAmount: '', toAmount: typedAmount };
    }
    if (direction === 'fromInput') {
      const out = computeOutputAmount(n, fromToken, toToken, slippageBps);
      return { fromAmount: typedAmount, toAmount: formatAmount(out) };
    }
    const inAmt = computeInputAmount(n, fromToken, toToken, slippageBps);
    return { fromAmount: formatAmount(inAmt), toAmount: typedAmount };
  }, [typedAmount, direction, fromToken, toToken, slippageBps]);

  const fromBalance = fromSymbol ? MOCK_BALANCES[fromSymbol] ?? null : null;
  const fromAmountNum = parseFloat(fromAmount);

  const error = (() => {
    if (!fromToken || !toToken) return null;
    if (fromToken.symbol === toToken.symbol) {
      return 'Choose two different tokens.';
    }
    if (fromAmount && (!Number.isFinite(fromAmountNum) || fromAmountNum <= 0)) {
      return 'Enter a positive amount.';
    }
    if (
      fromBalance != null &&
      Number.isFinite(fromAmountNum) &&
      fromAmountNum > fromBalance
    ) {
      return `Insufficient balance. You have ${fromBalance} ${fromToken.symbol}.`;
    }
    return null;
  })();

  const canSubmit =
    !error &&
    !submitting &&
    fromToken &&
    toToken &&
    Number.isFinite(fromAmountNum) &&
    fromAmountNum > 0 &&
    parseFloat(toAmount) > 0;

  const fromUsd =
    Number.isFinite(fromAmountNum) && fromToken
      ? fromAmountNum * fromToken.priceUsd
      : 0;
  const toAmountNum = parseFloat(toAmount);
  const toUsd =
    Number.isFinite(toAmountNum) && toToken ? toAmountNum * toToken.priceUsd : 0;

  const rate =
    fromToken && toToken ? computeRate(fromToken, toToken) : 0;

  function handleFlip() {
    if (!fromToken || !toToken) return;
    setFromSymbol(toToken.symbol);
    setToSymbol(fromToken.symbol);

    setDirection((d) => (d === 'fromInput' ? 'toInput' : 'fromInput'));
  }

  async function handleSubmit() {
    if (!canSubmit || !fromToken || !toToken) return;
    setSubmitting(true);
    // Simulate a backend call per the brief's hint.
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);

    addRecent({
      id: crypto.randomUUID(),
      fromSymbol: fromToken.symbol,
      toSymbol: toToken.symbol,
      fromAmount: fromAmountNum,
      toAmount: parseFloat(toAmount),
      rate,
      submittedAt: new Date().toISOString(),
    });
    setToast({
      msg: `Swapped ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`,
      severity: 'success',
    });
    setTypedAmount('');
  }

  if (tokensQuery.isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="circular" width={36} height={36} sx={{ mx: 'auto' }} />
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="rounded" height={48} />
        </Stack>
      </Paper>
    );
  }

  if (tokensQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => tokensQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Couldn’t load token prices. Check your connection and try again.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Swap</Typography>
        <SettingsMenu slippageBps={slippageBps} onChange={setSlippageBps} />
      </Stack>

      <Box sx={{ position: 'relative' }}>
        <TokenAmountInput
          label="You pay"
          token={fromToken}
          amount={fromAmount}
          onAmountChange={(v) => {
            setDirection('fromInput');
            setTypedAmount(v);
          }}
          onSelectToken={() => setPickerOpenFor('from')}
          usdValue={fromUsd}
          balance={fromBalance}
          onMax={
            fromBalance != null
              ? () => {
                  setDirection('fromInput');
                  setTypedAmount(String(fromBalance));
                }
              : undefined
          }
          errorText={error ?? undefined}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: -1.5,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <SwapDirectionButton
            onClick={handleFlip}
            disabled={!fromToken || !toToken}
          />
        </Box>

        <TokenAmountInput
          label="You receive"
          token={toToken}
          amount={toAmount}
          onAmountChange={(v) => {
            setDirection('toInput');
            setTypedAmount(v);
          }}
          onSelectToken={() => setPickerOpenFor('to')}
          readOnlyQuote
          usdValue={toUsd}
        />
      </Box>

      {fromToken && toToken && rate > 0 && (
        <Stack spacing={0.5} sx={{ mt: 2, color: 'text.secondary' }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Rate</Typography>
            <Typography variant="caption">
              1 {fromToken.symbol} ≈{' '}
              {rate.toLocaleString(undefined, { maximumSignificantDigits: 6 })}{' '}
              {toToken.symbol}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Slippage tolerance</Typography>
            <Typography variant="caption">{slippageBps / 100}%</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Price as of</Typography>
            <Typography variant="caption">
              {new Date(fromToken.priceAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </Stack>
      )}

      <Button
        fullWidth
        size="large"
        variant="contained"
        disabled={!canSubmit}
        onClick={handleSubmit}
        sx={{ mt: 3 }}
        startIcon={
          submitting ? (
            <CircularProgress size={18} color="inherit" />
          ) : undefined
        }
      >
        {submitting
          ? 'Swapping…'
          : !fromToken || !toToken
          ? 'Select tokens'
          : !fromAmount
          ? 'Enter an amount'
          : error
          ? error
          : 'Swap'}
      </Button>

      <TokenPicker
        open={pickerOpenFor === 'from'}
        onClose={() => setPickerOpenFor(null)}
        tokens={tokens}
        excludeSymbol={toSymbol ?? undefined}
        onSelect={(t) => {
          setFromSymbol(t.symbol);
          setPickerOpenFor(null);
        }}
      />
      <TokenPicker
        open={pickerOpenFor === 'to'}
        onClose={() => setPickerOpenFor(null)}
        tokens={tokens}
        excludeSymbol={fromSymbol ?? undefined}
        onSelect={(t) => {
          setToSymbol(t.symbol);
          setPickerOpenFor(null);
        }}
      />

      {toast && (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast(null)}
          >
            {toast.msg}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
}

function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '';
  return n
    .toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false })
    .replace(/\.?0+$/, '');
}