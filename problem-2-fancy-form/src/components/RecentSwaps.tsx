import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { TokenIcon } from '../components/TokenIcon';
import { useRecentSwaps } from '../hooks/useRecentSwaps';

export function RecentSwaps() {
  const { swaps, clear } = useRecentSwaps();
  if (swaps.length === 0) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <HistoryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="subtitle2">Recent swaps</Typography>
        </Stack>
        <Button size="small" onClick={clear} sx={{ fontSize: 12 }}>
          Clear
        </Button>
      </Stack>

      <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
        {swaps.map((s) => (
          <Stack
            key={s.id}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Stack direction="row" sx={{ '& > *:not(:first-of-type)': { ml: -0.75 } }}>
                <TokenIcon symbol={s.fromSymbol} size={26} />
                <TokenIcon symbol={s.toSymbol} size={26} />
              </Stack>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {s.fromAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                  {s.fromSymbol} → {s.toAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                  {s.toSymbol}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(s.submittedAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              @ {s.rate.toLocaleString(undefined, { maximumSignificantDigits: 4 })}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
