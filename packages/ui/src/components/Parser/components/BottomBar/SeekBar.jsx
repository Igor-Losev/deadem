import { Box, Slider } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { REFRESH_INTERVAL_SEEK_BAR_MS } from '../../config';
import { FONT_SIZE } from '../../theme';

import { formatTime } from './formatTime';

const CONTAINER_SX = { position: 'relative', px: 2 };

export default function SeekBar({ ticks, tickStore, tickInterval, disabled, onSeek, playing }) {
  const containerRef = useRef(null);
  const lastProgressUpdateRef = useRef(0);

  const [dragValue, setDragValue] = useState(null);
  const [hoverTick, setHoverTick] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [current, setCurrent] = useState(() => tickStore.getCurrent());

  const loaded = ticks.last > ticks.first;

  useEffect(() => {
    const updateCurrent = (force = false) => {
      const next = tickStore.getCurrent();
      const now = performance.now();

      if (
        force ||
        !playing ||
        now - lastProgressUpdateRef.current >= REFRESH_INTERVAL_SEEK_BAR_MS
      ) {
        lastProgressUpdateRef.current = now;
        setCurrent(next);
      }
    };

    updateCurrent(true);

    return tickStore.subscribe(() => updateCurrent(false));
  }, [playing, tickStore]);

  const handleChange = (event, value) => setDragValue(value);

  const handleChangeCommitted = (event, value) => {
    setDragValue(null);

    if (typeof onSeek === 'function') {
      onSeek(value);
    }
  };

  const handleMouseMove = useCallback((event) => {
    const rail = containerRef.current?.querySelector('.MuiSlider-rail');

    if (!rail || !loaded) {
      return;
    }

    const rect = rail.getBoundingClientRect();
    const x = event.clientX - rect.left;

    if (x < 0 || x > rect.width) {
      setHoverTick(null);
      return;
    }

    const ratio = rect.width === 0 ? 0 : x / rect.width;
    const tick = Math.round(ticks.first + ratio * (ticks.last - ticks.first));

    setHoverTick(tick);
    setHoverX(event.clientX - containerRef.current.getBoundingClientRect().left);
  }, [loaded, ticks.first, ticks.last]);

  const handleMouseLeave = useCallback(() => setHoverTick(null), []);

  const sliderValue = dragValue ?? (loaded ? Math.max(current, ticks.first) : 0);

  const sliderSx = useMemo(() => ({
    borderRadius: 0,
    cursor: loaded ? 'pointer' : 'default',
    height: 3,
    padding: '8px 0',
    marginBottom: '-8px',
    transition: 'height 0.15s',
    '&:hover': { height: loaded ? 5 : 3 },
    '& .MuiSlider-thumb': {
      height: 0,
      width: 0,
      transition: 'height 0.15s, width 0.15s',
      '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: 'none' }
    },
    '&:hover .MuiSlider-thumb': {
      height: loaded ? 14 : 0,
      width: loaded ? 14 : 0
    },
    '& .MuiSlider-track': { transition: 'none' },
    '& .MuiSlider-rail': { opacity: 0.3 }
  }), [loaded]);

  return (
    <Box
      ref={containerRef}
      onMouseMove={loaded ? handleMouseMove : undefined}
      onMouseLeave={loaded ? handleMouseLeave : undefined}
      sx={CONTAINER_SX}
    >
      <Slider
        disabled={disabled}
        min={loaded ? ticks.first : 0}
        max={loaded ? ticks.last : 1}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        size='small'
        value={sliderValue}
        sx={sliderSx}
      />

      {hoverTick !== null && (
        <Box
          sx={{
            position: 'absolute',
            left: hoverX,
            top: -28,
            transform: 'translateX(-50%)',
            backgroundColor: 'grey.800',
            borderRadius: '4px',
            color: 'common.white',
            fontSize: FONT_SIZE.sm,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            padding: '4px 6px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {tickInterval !== null ? `${formatTime(hoverTick * tickInterval)} / ` : ''}{hoverTick}
        </Box>
      )}
    </Box>
  );
}
