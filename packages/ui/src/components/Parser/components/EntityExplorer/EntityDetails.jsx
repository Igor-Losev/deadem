import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';

import { FONT_SIZE } from './../../theme';
import { HighlightedJson } from './../../utils';

const HEADER_SURFACE_SX = { backgroundColor: 'rgba(255,255,255,0.025)', height: 44 };

export default function EntityDetails({ entity, json, copied, onCopy }) {
  return (
    <>
      <Box alignItems='center' display='flex' justifyContent='space-between' px={1} sx={HEADER_SURFACE_SX}>
        <Typography color='text.secondary' fontSize={FONT_SIZE.sm} noWrap>
          {entity.class.name}
          <Typography component='span' color='text.disabled' fontSize={FONT_SIZE.sm}>
            {' '}/ index={entity.index}
          </Typography>
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy JSON'} arrow>
          <IconButton onClick={onCopy} size='small'>
            <ContentCopyIcon sx={{ fontSize: FONT_SIZE.lg }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      <Box flex={1} overflow='auto' px={1.5} py={1}>
        <pre
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
            fontSize: FONT_SIZE.sm,
            lineHeight: 1.65,
            margin: 0
          }}
        >
          <HighlightedJson json={json} />
        </pre>
      </Box>
    </>
  );
}
