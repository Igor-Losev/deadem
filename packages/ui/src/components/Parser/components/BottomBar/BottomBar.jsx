import { Box, Container, Paper } from '@mui/material';
import { memo } from 'react';

import Controls, { PlaybackSpeed } from './Controls';
import SeekBar from './SeekBar';
import TickJumper from './TickJumper';
import TimeDisplay from './TimeDisplay';

const DEFAULT_TICKS = { first: -1, last: -1 };

function BottomBar({
  demo,
  gameInfo = null,
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
  tickStore,
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
        {gameInfo}

        <SeekBar ticks={ticks} tickStore={tickStore} tickInterval={tickInterval} disabled={!loaded} onSeek={onSeek} />

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
            <TickJumper ticks={ticks} tickStore={tickStore} loaded={loaded} onSeek={onSeek} />
          </Box>

          <Controls
            disabled={disabled}
            loaded={loaded}
            onNextTick={onNextTick}
            onPauseClick={onPauseClick}
            onPlayClick={onPlayClick}
            onPrevTick={onPrevTick}
            onSeekToEnd={onSeekToEnd}
            onSeekToStart={onSeekToStart}
            playing={playing}
            seeking={seeking}
          />

          <Box alignItems='center' display='flex' flex={1} gap={0.5} justifyContent='space-between'>
            <PlaybackSpeed disabled={!loaded || seeking} onRateChange={onRateChange} rate={rate} />

            <TimeDisplay tickStore={tickStore} tickInterval={tickInterval} loaded={loaded} last={ticks.last} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default memo(BottomBar);
