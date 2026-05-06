import {
  Box,
  Button,
  InputBase,
  Stack,
  Typography,
  Skeleton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { TokenIcon } from './TokenIcon';
import type { Token } from '../domain/types';

interface Props {
  label: string;
  token: Token | null;
  amount: string;
  onAmountChange: (value: string) => void;
  onSelectToken: () => void;
  readOnlyQuote?: boolean;
  usdValue?: number;
  balance?: number | null;
  onMax?: (() => void) | undefined;
  errorText?: string | undefined;
  loading?: boolean;
}

export function TokenAmountInput({
  label,
  token,
  amount,
  onAmountChange,
  onSelectToken,
  readOnlyQuote,
  usdValue,
  balance,
  onMax,
  errorText,
  loading,
}: Props) {
  const showMax = onMax && balance != null && balance > 0;

  return (
    <Box
      sx={(t) => ({
        border: '1px solid',
        borderColor: errorText ? 'error.main' : 'divider',
        borderRadius: 2,
        bgcolor: t.palette.background.paper,
        p: 2,
        transition: 'border-color 120ms',
        '&:focus-within': {
          borderColor: errorText ? 'error.main' : 'primary.main',
        },
      })}
    >
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {showMax && (
          <Typography variant="caption" color="text.secondary">
            Balance:{' '}
            <Box
              component="span"
              sx={{ color: 'text.primary', fontWeight: 500 }}
            >
              {balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </Box>
          </Typography>
        )}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2}>
        <InputBase
          value={amount}
          onChange={(e) => onAmountChange(sanitize(e.target.value))}
          placeholder="0.0"
          inputProps={{
            inputMode: 'decimal',
            'aria-label': `${label} amount`,
            pattern: '[0-9]*[.,]?[0-9]*',
          }}
          startAdornment={
            readOnlyQuote && amount ? (
              <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>
                ≈
              </Typography>
            ) : null
          }
          sx={{
            flex: 1,
            '& input': {
              fontSize: '1.6rem',
              fontWeight: 500,
              p: 0,
            },
          }}
        />

        <Button
          onClick={onSelectToken}
          variant="outlined"
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            minWidth: 110,
            justifyContent: 'space-between',
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.default',
            '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
          }}
        >
          {token ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <TokenIcon symbol={token.symbol} size={22} />
              <span>{token.symbol}</span>
            </Stack>
          ) : (
            'Select'
          )}
        </Button>
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 1, minHeight: 20 }}
      >
        <Typography variant="caption" color="text.secondary">
          {loading ? (
            <Skeleton width={70} />
          ) : usdValue && usdValue > 0 ? (
            `≈ $${usdValue.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}`
          ) : null}
        </Typography>
        {showMax && (
          <Button
            size="small"
            onClick={onMax}
            sx={{ minWidth: 0, px: 1, py: 0, fontSize: 12 }}
          >
            MAX
          </Button>
        )}
      </Stack>

      {errorText && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {errorText}
        </Typography>
      )}
    </Box>
  );
}

function sanitize(raw: string): string {
  // Replace comma with dot for European-keyboard users, then strip anything
  // that isn't a digit or the first dot.
  const normalized = raw.replace(',', '.');
  const cleaned = normalized.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, '')
  );
}
