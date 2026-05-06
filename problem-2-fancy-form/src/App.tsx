import { Box, Container, Stack, Typography } from '@mui/material';
import { SwapCard } from './components/SwapCard';
import { RecentSwaps } from './components/RecentSwaps';

export function App() {
  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h5" component="h1">
              Currency Swap
            </Typography>
            <Typography variant="body2">
              Swap any token for another at the latest indicative rate.
            </Typography>
          </Stack>

          <SwapCard />
          <RecentSwaps />
        </Stack>
      </Container>
    </Box>
  );
}
