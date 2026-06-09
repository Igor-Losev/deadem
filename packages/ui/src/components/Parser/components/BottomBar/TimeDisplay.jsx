import { Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { FONT_SIZE } from '../../theme';

import { formatTime } from './formatTime';

export default function TimeDisplay({ tickStore, tickInterval, loaded, last }) {
  const showTime = loaded && tickInterval !== null;

  const currentLabelRef = useRef('—');
  const [currentLabel, setCurrentLabel] = useState('—');

  useEffect(() => {
    if (!showTime) {
      currentLabelRef.current = '—';

      setCurrentLabel('—');

      return undefined;
    }

    const updateCurrentLabel = () => {
      const nextLabel = formatTime(tickStore.getCurrent() * tickInterval);

      if (currentLabelRef.current !== nextLabel) {
        currentLabelRef.current = nextLabel;

        setCurrentLabel(nextLabel);
      }
    };

    updateCurrentLabel();

    return tickStore.subscribe(updateCurrentLabel);
  }, [showTime, tickInterval, tickStore]);

  return (
    <Tooltip title='Demo timeline (not in-game clock)' arrow>
      <Typography
        color='text.primary'
        fontSize={FONT_SIZE.lg}
        marginX={1}
        sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
      >
        {currentLabel}
        <Typography component='span' color='text.secondary' fontSize={FONT_SIZE.lg}>
          {' / '}{showTime ? formatTime(last * tickInterval) : '—'}
        </Typography>
      </Typography>
    </Tooltip>
  );
}
