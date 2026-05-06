import { IconButton, Tooltip } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function SwapDirectionButton({ onClick, disabled = false }: Props) {
  return (
    <Tooltip title="Flip direction">
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          size="small"
          sx={(t) => ({
            border: '4px solid',
            borderColor: t.palette.background.default,
            bgcolor: 'background.paper',
            boxShadow: 1,
            transition: 'transform 200ms',
            '&:hover': {
              bgcolor: 'background.paper',
              transform: 'rotate(180deg)',
            },
          })}
        >
          <SwapVertIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}