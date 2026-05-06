import {
  Box,
  IconButton,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { useState } from 'react';

interface Props {
  slippageBps: number;
  onChange: (bps: number) => void;
}

const PRESETS = [10, 50, 100];

export function SettingsMenu({ slippageBps, onChange }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isPreset = PRESETS.includes(slippageBps);
  const [customValue, setCustomValue] = useState(
    isPreset ? '' : (slippageBps / 100).toString(),
  );

  return (
    <>
      <Tooltip title="Settings">
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="settings"
        >
          <TuneIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 2, mt: 1, width: 280 } }}
      >
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Slippage tolerance</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={isPreset ? slippageBps : null}
            onChange={(_, v: number | null) => {
              if (v !== null) {
                onChange(v);
                setCustomValue('');
              }
            }}
            sx={{ '& .MuiToggleButton-root': { flex: 1 } }}
          >
            {PRESETS.map((bps) => (
              <ToggleButton key={bps} value={bps}>
                {bps / 100}%
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Box>
            <TextField
              size="small"
              fullWidth
              label="Custom"
              value={customValue}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, '');
                setCustomValue(raw);
                const pct = parseFloat(raw);
                if (Number.isFinite(pct) && pct >= 0 && pct <= 50) {
                  onChange(Math.round(pct * 100));
                }
              }}
              InputProps={{ endAdornment: '%' }}
            />
            <Typography variant="caption" color="text.secondary">
              Your transaction will revert if the price changes by more than
              this amount.
            </Typography>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
