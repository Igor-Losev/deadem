import { Box } from '@mui/material';
import { useMemo } from 'react';

import { DANCER_VIEW_BOX, getDancerAnimationPaths } from './animation-ai-rocket-science';

export default function DancerAnimation({ frame }) {
  const paths = useMemo(() => getDancerAnimationPaths(frame), [ frame ]);

  return (
    <Box
      aria-hidden='true'
      component='svg'
      focusable='false'
      viewBox={DANCER_VIEW_BOX}
    >
      {paths.map((path) => (
        <path
          key={path.key}
          d={path.d}
          fill={path.fillOpacity > 0 ? 'currentColor' : 'none'}
          fillOpacity={path.fillOpacity}
          opacity={path.opacity}
          stroke={path.strokeWidth > 0 ? 'currentColor' : 'none'}
          strokeLinecap={path.strokeLinecap}
          strokeLinejoin={path.strokeLinejoin}
          strokeOpacity={path.strokeOpacity}
          strokeWidth={path.strokeWidth}
          transform={path.transform}
        />
      ))}
    </Box>
  );
}
