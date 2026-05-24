import { Tooltip, Typography } from '@mui/material';

import { FONT_SIZE } from '../../theme';
import { useCurrentTick } from '../../tickStore';

import { formatTime } from './formatTime';

export default function TimeDisplay({ tickStore, tickInterval, loaded, last }) {
  const current = useCurrentTick(tickStore);
  const showTime = loaded && tickInterval !== null;

  return (
    <Tooltip title='Demo timeline (not in-game clock)' arrow>
      <Typography
        color='text.primary'
        fontSize={FONT_SIZE.lg}
        marginX={1}
        sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
      >
        {showTime ? formatTime(current * tickInterval) : '—'}
        <Typography component='span' color='text.secondary' fontSize={FONT_SIZE.lg}>
          {' / '}{showTime ? formatTime(last * tickInterval) : '—'}
        </Typography>
      </Typography>
    </Tooltip>
  );
}
