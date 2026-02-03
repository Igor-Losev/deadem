import { Pause as PauseIcon, PlayCircle as PlayCircleIcon } from '@mui/icons-material';
import { Box, Container, Divider, IconButton, LinearProgress, Paper, Tooltip, Typography } from '@mui/material';

const CONTROL_ICON_SIZE = '32px';
const INCREMENTAL_ICON_SIZE = '40px';

const INCREMENTAL_BUTTONS = [
  {
    count: 1,
    tooltip: '+1 Packet'
  },
  {
    count: 10,
    tooltip: '+10 Packets',
  },
  {
    count: 100,
    tooltip: '+100 Packets',
  },
  {
    count: 1000,
    tooltip: '+1000 Packets'
  }
];

export default function BottomBar({
  game: { clockGame, clockTotal, paused, tick, state },
  height,
  onIncrementClick,
  onPauseClick,
  onPlayClick,
  status: { done, processing }
}) {
  const handleIncrementClicked = (count) => {
    if (typeof onIncrementClick === 'function') {
      onIncrementClick(count);
    }
  }

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

  const disabled = done || processing;

  return (
    <Container sx={{ bottom: 0, left: 0, position: 'fixed', right: 0 }}>
      {!done && !processing && <LinearProgress variant='determinate' value={0} />}
      {!done && processing && <LinearProgress />}
      {done && !processing && <LinearProgress color='success' variant='determinate' value={100} />}

      <Box
        component={Paper}
        elevation={0}
        sx={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          height: height || '60px',
          overflowX: 'auto'
        }}
      >
        <Box alignItems='center' display='flex' flex={1} justifyContent='flex-end' marginRight={1}>
          {labels.map((label, index) => (
            <Box key={label.key} display='flex' alignItems='center'>
              <Tooltip title={label.tooltip} arrow>
                <Typography
                  color='text.secondary'
                  fontSize='0.875rem'
                  marginX={1}
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {label.value}
                </Typography>
              </Tooltip>
              {index < labels.length - 1 && (
                <Divider orientation='vertical' flexItem sx={{ my: 2 }} />
              )}
            </Box>
          ))}
        </Box>

        <Box alignItems='center' display='flex' justifyContent='center' width={50}>
          {!processing ? (
            <Tooltip arrow title='Play'>
              <IconButton disabled={disabled} onClick={handlePlayClicked}>
                <PlayCircleIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip arrow title='Pause'>
              <IconButton disabled={!processing} onClick={handlePauseClicked}>
                <PauseIcon sx={{ height: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box alignItems='center' display='flex' flex={1} justifyContent='flex-start'>
          {INCREMENTAL_BUTTONS.map((button) => (
            <Tooltip title={button.tooltip} key={button.count} arrow>
              <IconButton
                disabled={disabled}
                onClick={() => handleIncrementClicked(button.count)}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: '50%',
                  height: INCREMENTAL_ICON_SIZE,
                  marginX: 0.4,
                  minWidth: INCREMENTAL_ICON_SIZE,
                  padding: 1,
                  width: INCREMENTAL_ICON_SIZE,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                +{button.count}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
