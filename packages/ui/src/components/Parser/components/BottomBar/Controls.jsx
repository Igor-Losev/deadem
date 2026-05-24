import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Pause as PauseIcon,
  PlayCircle as PlayCircleIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon
} from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { memo } from 'react';

import { FONT_SIZE } from '../../theme';

const CONTROL_ICON_SIZE = '32px';

const Controls = memo(function Controls({
  disabled,
  loaded,
  onNextTick,
  onPauseClick,
  onPlayClick,
  onPrevTick,
  onSeekToEnd,
  onSeekToStart,
  playing,
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
    </Box>
  );
});

const PlaybackSpeed = memo(function PlaybackSpeed({ disabled, onRateChange, rate }) {
  return (
    <Tooltip arrow title='Playback Speed'>
      <IconButton disabled={disabled} onClick={onRateChange} sx={{ marginLeft: '4px' }}>
        <Typography sx={{ fontSize: FONT_SIZE.md, fontWeight: 600, height: CONTROL_ICON_SIZE, lineHeight: CONTROL_ICON_SIZE, width: CONTROL_ICON_SIZE }}>
          {rate}x
        </Typography>
      </IconButton>
    </Tooltip>
  );
});

export { PlaybackSpeed };
export default Controls;
