import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Pause as PauseIcon, PlayCircle as PlayCircleIcon, SkipNext as SkipNextIcon, SkipPrevious as SkipPreviousIcon } from '@mui/icons-material';
import { Box, Button, Container, Divider, IconButton, Paper, Popover, Slider, TextField, Tooltip, Typography } from '@mui/material';
import { memo, useCallback, useRef, useState } from 'react';

import { FONT_SIZE } from '../../theme';

const CONTROL_ICON_SIZE = '32px';

function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds) || seconds < 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default memo(function BottomBar({
  demo,
  game: { clockGame, clockTotal, paused, tick, state },
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
  ticks = { current: -1, first: -1, last: -1 }
}) {
  const handlePauseClicked = () => {
    if (typeof onPauseClick === 'function') {
      onPauseClick();
    }
  }

  const handlePlayClicked = () => {
    if (typeof onPlayClick === 'function') {
      onPlayClick();
    }
  }

  const [dragValue, setDragValue] = useState(null);

  const handleSeekChange = (event, value) => {
    setDragValue(value);
  };

  const handleSeekCommitted = (event, value) => {
    setDragValue(null);

    if (typeof onSeek === 'function') {
      onSeek(value);
    }
  };

  const sliderRef = useRef(null);
  const [hoverTick, setHoverTick] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  const handleSliderMouseMove = useCallback((event) => {
    const rail = sliderRef.current?.querySelector('.MuiSlider-rail');

    if (!rail || ticks.last <= ticks.first) {
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
    setHoverX(event.clientX - sliderRef.current.getBoundingClientRect().left);
  }, [ticks]);

  const handleSliderMouseLeave = useCallback(() => {
    setHoverTick(null);
  }, []);

  const [seekAnchor, setSeekAnchor] = useState(null);
  const [seekValue, setSeekValue] = useState('');

  const handleSeekOpen = (event) => {
    setSeekValue(String(ticks.current));
    setSeekAnchor(event.currentTarget);
  };

  const handleSeekClose = () => {
    setSeekAnchor(null);
  };

  const handleSeekApply = () => {
    const tick = parseInt(seekValue, 10);

    if (!isNaN(tick) && typeof onSeek === 'function') {
      onSeek(Math.max(ticks.first, Math.min(ticks.last, tick)));
    }

    setSeekAnchor(null);
  };

  const labels = [
    {
      key: 'state',
      value: state,
      tooltip: 'Game State'
    },
    {
      key: 'paused',
      value: paused,
      tooltip: 'Pause'
    },
    {
      key: 'tick',
      value: tick,
      tooltip: 'Tick'
    },
    {
      key: 'clockGame',
      value: clockGame,
      tooltip: 'In-Game Time'
    },
    {
      key: 'clockTotal',
      value: clockTotal,
      tooltip: 'Total Time'
    }
  ];

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
        <Box
          ref={sliderRef}
          onMouseMove={loaded ? handleSliderMouseMove : undefined}
          onMouseLeave={loaded ? handleSliderMouseLeave : undefined}
          sx={{ position: 'relative', px: 2 }}
        >
          <Slider
            disabled={!loaded}
            min={loaded ? ticks.first : 0}
            max={loaded ? ticks.last : 1}
            onChange={handleSeekChange}
            onChangeCommitted={handleSeekCommitted}
            size='small'
            value={dragValue ?? (loaded ? (ticks.current >= ticks.first ? ticks.current : ticks.first) : 0)}
            sx={{
              borderRadius: 0,
              cursor: loaded ? 'pointer' : 'default',
              height: 3,
              padding: '8px 0',
              marginBottom: '-8px',
              transition: 'height 0.15s',
              '&:hover': {
                height: loaded ? 5 : 3
              },
              '& .MuiSlider-thumb': {
                height: 0,
                width: 0,
                transition: 'height 0.15s, width 0.15s',
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none'
                }
              },
              '&:hover .MuiSlider-thumb': {
                height: loaded ? 14 : 0,
                width: loaded ? 14 : 0
              },
              '& .MuiSlider-track': {
                transition: 'none'
              },
              '& .MuiSlider-rail': {
                opacity: 0.3
              }
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
            <Typography
              color='text.secondary'
              fontSize={FONT_SIZE.lg}
              onClick={loaded ? handleSeekOpen : undefined}
              sx={{
                fontVariantNumeric: 'tabular-nums',
                cursor: loaded ? 'pointer' : 'default',
                borderBottom: loaded ? '1px dashed' : 'none',
                borderColor: 'text.disabled'
              }}
            >
              {loaded ? ticks.current : '—'}
            </Typography>
            <Typography
              color='text.secondary'
              fontSize={FONT_SIZE.lg}
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              &nbsp;/ {loaded ? ticks.last : '—'}
            </Typography>

            <Popover
              open={Boolean(seekAnchor)}
              anchorEl={seekAnchor}
              onClose={handleSeekClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Box display='flex' alignItems='center' gap={1} p={1}>
                <TextField
                  autoFocus
                  size='small'
                  label='Tick'
                  value={seekValue}
                  onChange={(e) => setSeekValue(e.target.value.replace(/[^0-9-]/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSeekApply(); }}
                  sx={{ width: 110 }}
                  inputProps={{ style: { fontVariantNumeric: 'tabular-nums', fontSize: FONT_SIZE.md } }}
                  InputLabelProps={{ style: { fontSize: FONT_SIZE.md } }}
                />
                <Button variant='contained' size='small' onClick={handleSeekApply} sx={{ fontSize: FONT_SIZE.sm }}>
                  OK
                </Button>
              </Box>
            </Popover>
          </Box>

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

            {!playing ? (
              <Tooltip arrow title='Play'>
                <IconButton disabled={disabled} onClick={handlePlayClicked}>
                  <PlayCircleIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip arrow title='Pause'>
                <IconButton onClick={handlePauseClicked}>
                  <PauseIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
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

          <Box alignItems='center' display='flex' flex={1} justifyContent='flex-end'>
            {labels.map((label, index) => (
              <Box key={label.key} display='flex' alignItems='center'>
                <Tooltip title={label.tooltip} arrow>
                  <Typography
                    color='text.secondary'
                    fontSize={FONT_SIZE.lg}
                    marginX={1}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {label.value}
                  </Typography>
                </Tooltip>
                <Divider orientation='vertical' flexItem sx={{ my: 2 }} />
              </Box>
            ))}
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
})
