import { GitHub as GitHubIcon } from '@mui/icons-material';
import { Box, IconButton, Link } from '@mui/material';
import { useState } from 'react';

import Dancer from '../Dancer/Dancer';

const REPO_URL = 'https://github.com/Igor-Losev/deadem';
const RELEASES_URL = `${REPO_URL}/releases`;

export default function HeaderActions({ version }) {
  const [active, setActive] = useState(false);

  const activate = () => setActive(true);
  const deactivate = () => setActive(false);

  return (
    <Box alignItems='center' display='flex' flex={1} gap={1} justifyContent='flex-end'>
      <Dancer active={active} />
      <Link
        color='text.secondary'
        fontSize='0.875rem'
        href={RELEASES_URL}
        onBlur={deactivate}
        onFocus={activate}
        onMouseEnter={activate}
        onMouseLeave={deactivate}
        sx={{
          '&:hover': { color: 'text.primary' },
          transition: 'color 120ms ease',
          whiteSpace: 'nowrap'
        }}
        target='_blank'
        underline='none'
      >
        v{version}
      </Link>
      <IconButton
        aria-label='GitHub repository'
        href={REPO_URL}
        onBlur={deactivate}
        onFocus={activate}
        onMouseEnter={activate}
        onMouseLeave={deactivate}
        size='small'
        sx={{
          height: 36,
          width: 36,
          '& svg': { transition: 'color 120ms ease' },
          '&:hover svg, &:focus-visible svg': {
            color: 'text.primary'
          }
        }}
        target='_blank'
      >
        <GitHubIcon sx={{ fontSize: '1.4rem' }} />
      </IconButton>
    </Box>
  );
}
