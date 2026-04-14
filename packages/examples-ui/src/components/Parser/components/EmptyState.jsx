import { Box, Typography } from '@mui/material';

export default function EmptyState({ icon, text }) {
  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' gap={1} flex={1} minHeight={140} width='100%'>
      {icon}
      <Typography color='text.disabled' fontSize='0.875rem'>{text}</Typography>
    </Box>
  );
}
