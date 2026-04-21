import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Pause as PauseIcon,
  PlayCircle as PlayCircleIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon
} from '@mui/icons-material';
import { Box, Button, Container, IconButton, Paper, Popover, Slider, TextField, Tooltip, Typography } from '@mui/material';
import { memo, useCallback, useRef, useState } from 'react';

import { FONT_SIZE } from '../../theme';

const CONTROL_ICON_SIZE = '32px';
const DEFAULT_TICKS = { current: -1, first: -1, last: -1 };

function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds) || seconds < 0) {
    return '—';
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

function SeekBar({ ticks, tickInterval, disabled, onSeek }) {
  const containerRef = useRef(null);
  const [dragValue, setDragValue] = useState(null);
  const [hoverTick, setHoverTick] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  const loaded = ticks.last > ticks.first;

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

    const ratio = x / rect.width;
    const tick = Math.round(ticks.first + ratio * (ticks.last - ticks.first));

    setHoverTick(tick);
    setHoverX(event.clientX - containerRef.current.getBoundingClientRect().left);
  }, [ticks, loaded]);

  const handleMouseLeave = useCallback(() => setHoverTick(null), []);

  const sliderValue = dragValue ?? (loaded ? Math.max(ticks.current, ticks.first) : 0);

  return (
    <Box
      ref={containerRef}
      onMouseMove={loaded ? handleMouseMove : undefined}
      onMouseLeave={loaded ? handleMouseLeave : undefined}
      sx={{ position: 'relative', px: 2 }}
    >
      <Slider
        disabled={disabled}
        min={loaded ? ticks.first : 0}
        max={loaded ? ticks.last : 1}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        size='small'
        value={sliderValue}
        sx={{
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
        }}
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

function TickJumper({ ticks, loaded, onSeek }) {
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

function Controls({
  disabled,
  loaded,
  onNextTick,
  onPauseClick,
  onPlayClick,
  onPrevTick,
  onRateChange,
  onSeekToEnd,
  onSeekToStart,
  playing,
  rate,
  seeking
}) {
  return (
    <Box alignItems='center' display='flex' gap={0.5}>
      <Tooltip arrow title='Skip to Start'>
        <IconButton disabled={!loaded || seeking} onClick={onSeekToStart}>
          <SkipPreviousIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
        </IconButton>
      </Tooltip>

      <Tooltip arrow title='Previous Tick'>
        <IconButton disabled={disabled} onClick={onPrevTick}>
          <ChevronLeftIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
        </IconButton>
      </Tooltip>

      {playing ? (
        <Tooltip arrow title='Pause'>
          <IconButton onClick={onPauseClick}>
            <PauseIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip arrow title='Play'>
          <IconButton disabled={disabled} onClick={onPlayClick}>
            <PlayCircleIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip arrow title='Next Tick'>
        <IconButton disabled={disabled} onClick={onNextTick}>
          <ChevronRightIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
        </IconButton>
      </Tooltip>

      <Tooltip arrow title='Skip to End'>
        <IconButton disabled={!loaded || seeking} onClick={onSeekToEnd}>
          <SkipNextIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
        </IconButton>
      </Tooltip>

      <Tooltip arrow title='Playback Speed'>
        <IconButton disabled={!loaded || seeking} onClick={onRateChange}>
          <Typography sx={{ fontSize: FONT_SIZE.md, fontWeight: 600, height: CONTROL_ICON_SIZE, lineHeight: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }}>
            {rate}x
          </Typography>
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function BottomBar({
  demo,
  height,
  onNextTick,
  onPauseClick,
  onPlayClick,
  onPrevTick,
  onRateChange,
  onSeek,
  onSeekToEnd,
  onSeekToStart,
  playing = false,
  rate = 1,
  seeking = false,
  ticks = DEFAULT_TICKS
}) {
  const loaded = ticks.last > ticks.first;
  const disabled = !loaded || playing || seeking;
  const tickInterval = demo?.server?.tickInterval ?? null;

  return (
    <Container sx={{ bottom: 0, left: 0, position: 'fixed', right: 0 }}>
      <Box
        component={Paper}
        elevation={0}
        sx={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <SeekBar ticks={ticks} tickInterval={tickInterval} disabled={!loaded} onSeek={onSeek} />

        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: height || '60px',
            overflowX: 'auto',
            px: 2
          }}
        >
          <Box alignItems='baseline' display='flex' flex={1} justifyContent='flex-end' sx={{ mr: 1 }}>
            <TickJumper ticks={ticks} loaded={loaded} onSeek={onSeek} />
          </Box>

          <Controls
            disabled={disabled}
            loaded={loaded}
            onNextTick={onNextTick}
            onPauseClick={onPauseClick}
            onPlayClick={onPlayClick}
            onPrevTick={onPrevTick}
            onRateChange={onRateChange}
            onSeekToEnd={onSeekToEnd}
            onSeekToStart={onSeekToStart}
            playing={playing}
            rate={rate}
            seeking={seeking}
          />

          <Box alignItems='center' display='flex' flex={1} justifyContent='flex-end'>
            <Tooltip title='Demo timeline (not in-game clock)' arrow>
              <Typography
                color='text.primary'
                fontSize={FONT_SIZE.lg}
                marginX={1}
                sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
              >
                {loaded && tickInterval !== null ? formatTime(ticks.current * tickInterval) : '—'}
                <Typography component='span' color='text.secondary' fontSize={FONT_SIZE.lg}>
                  {' / '}{loaded && tickInterval !== null ? formatTime(ticks.last * tickInterval) : '—'}
                </Typography>
              </Typography>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default memo(BottomBar);
