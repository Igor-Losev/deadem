import { Box } from '@mui/material';
import { useState } from 'react';

import { COLORS } from './../Parser/theme';

import DancerAnimation from './DancerAnimation';

import { useDancerAnimationFrame } from './animation-ai-rocket-science';

const VIDEO_URL = 'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==';

export default function Dancer({ active = false }) {
  const [hovered, setHovered] = useState(false);

  const activeDancing = active || hovered;
  const frame = useDancerAnimationFrame(activeDancing);

  const handleClick = () => window.open(window.atob(VIDEO_URL), '_blank', 'noopener,noreferrer');

  return (
    <Box
      aria-label='Dancer'
      component='button'
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        alignItems: 'center',
        appearance: 'none',
        background: 'transparent',
        border: 0,
        color: 'text.secondary',
        cursor: 'pointer',
        display: 'inline-flex',
        height: 32,
        justifyContent: 'center',
        lineHeight: 0,
        opacity: activeDancing ? 0.85 : 0.45,
        overflow: 'hidden',
        padding: 0,
        position: 'relative',
        transform: activeDancing ? 'scale(1.04)' : 'none',
        transition: 'opacity 120ms ease, color 120ms ease, transform 120ms ease',
        WebkitAppearance: 'none',
        width: 32,
        ...(activeDancing ? { color: COLORS.accent } : {}),
        '&:active': {
          transform: 'none'
        },
        '&:hover': {
          color: COLORS.accent,
          opacity: 0.85,
          transform: 'scale(1.04)'
        },
        '&:focus-visible': {
          color: COLORS.accent,
          opacity: 0.85,
          outline: '1px solid currentColor',
          outlineOffset: 2,
          transform: 'scale(1.04)'
        },
        '& svg': {
          display: 'block',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
          transform: 'scaleX(-1)',
          width: 'auto'
        }
      }}
      type='button'
    >
      <DancerAnimation frame={frame} />
    </Box>
  );
}
