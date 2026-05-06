import { Avatar } from '@mui/material';
import { useState } from 'react';

interface Props {
  symbol: string;
  size?: number;
}

const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';


export function TokenIcon({ symbol, size = 28 }: Props) {
  const [errored, setErrored] = useState(false);

  const hue =
    [...symbol].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (errored) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: `hsl(${hue}deg 60% 92%)`,
          color: `hsl(${hue}deg 60% 35%)`,
          fontSize: size * 0.4,
          fontWeight: 700,
        }}
      >
        {symbol.slice(0, 2)}
      </Avatar>
    );
  }

  return (
    <Avatar
      key={symbol}
      src={`${ICON_BASE}/${symbol}.svg`}
      alt={symbol}
      onError={() => setErrored(true)}
      sx={{ width: size, height: size, bgcolor: 'transparent' }}
      imgProps={{ loading: 'lazy' }}
    />
  );
}