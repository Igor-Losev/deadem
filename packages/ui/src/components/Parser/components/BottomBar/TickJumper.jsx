import { Box, Button, Popover, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { FONT_SIZE } from '../../theme';

export default function TickJumper({ ticks, loaded, onSeek }) {
  const [anchor, setAnchor] = useState(null);
  const [value, setValue] = useState('');

  const handleOpen = (event) => {
    setValue(String(ticks.current));
    setAnchor(event.currentTarget);
  };

  const handleClose = () => setAnchor(null);

  const handleApply = () => {
    const tick = parseInt(value, 10);

    if (!isNaN(tick) && typeof onSeek === 'function') {
      onSeek(Math.max(ticks.first, Math.min(ticks.last, tick)));
    }

    setAnchor(null);
  };

  return (
    <>
      <Typography
        color='text.secondary'
        fontSize={FONT_SIZE.lg}
        onClick={loaded ? handleOpen : undefined}
        sx={{
          fontVariantNumeric: 'tabular-nums',
          cursor: loaded ? 'pointer' : 'default',
          borderBottom: loaded ? '1px dashed' : 'none',
          borderColor: 'text.disabled'
        }}
      >
        {loaded ? ticks.current : '—'}
      </Typography>
      <Typography color='text.secondary' fontSize={FONT_SIZE.lg} sx={{ fontVariantNumeric: 'tabular-nums' }}>
        &nbsp;/ {loaded ? ticks.last : '—'}
      </Typography>

      <Popover
        anchorEl={anchor}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleClose}
        open={Boolean(anchor)}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box display='flex' alignItems='center' gap={1} p={1}>
          <TextField
            autoFocus
            size='small'
            label='Tick'
            value={value}
            onChange={(event) => setValue(event.target.value.replace(/[^0-9-]/g, ''))}
            onKeyDown={(event) => { if (event.key === 'Enter') { handleApply(); } }}
            sx={{ width: 110 }}
            inputProps={{ style: { fontVariantNumeric: 'tabular-nums', fontSize: FONT_SIZE.md } }}
            InputLabelProps={{ style: { fontSize: FONT_SIZE.md } }}
          />
          <Button variant='contained' size='small' onClick={handleApply} sx={{ fontSize: FONT_SIZE.sm }}>
            OK
          </Button>
        </Box>
      </Popover>
    </>
  );
}
