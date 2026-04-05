import { Box } from '@mui/material';

export default function JsonBlock({ value }) {
  return (
    <Box
      component="pre"
      sx={{
        p: 1.5,
        m: 0,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.04)',
        overflowX: 'auto',
        fontSize: 13,
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Box>
  );
}
