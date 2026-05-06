import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useMemo, useState } from 'react';
import { TokenIcon } from './TokenIcon';
import type { Token } from '../domain/types';

interface Props {
  open: boolean;
  onClose: () => void;
  tokens: Token[];
  excludeSymbol?: string | undefined;
  onSelect: (token: Token) => void;
}

export function TokenPicker({
  open,
  onClose,
  tokens,
  excludeSymbol,
  onSelect,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) => t.symbol.toLowerCase().includes(q));
  }, [query, tokens]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Select a token</Typography>
          <IconButton onClick={onClose} size="small" aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="Search by symbol"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ maxHeight: 360, overflowY: 'auto', mx: -3, px: 1 }}>
          {filtered.length === 0 ? (
            <Typography
              variant="body2"
              align="center"
              sx={{ py: 4, color: 'text.secondary' }}
            >
              No tokens match “{query}”.
            </Typography>
          ) : (
            <List disablePadding>
              {filtered.map((t) => {
                const disabled = t.symbol === excludeSymbol;
                return (
                  <ListItemButton
                    key={t.symbol}
                    disabled={disabled}
                    onClick={() => onSelect(t)}
                    sx={{ borderRadius: 2, mx: 1 }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <TokenIcon symbol={t.symbol} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={t.symbol}
                      secondary={`$${formatPrice(t.priceUsd)}`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function formatPrice(p: number): string {
  if (p >= 1) return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return p.toLocaleString(undefined, { maximumSignificantDigits: 4 });
}