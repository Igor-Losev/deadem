import { InboxOutlined as InboxOutlinedIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

import DetailModal from './../DetailModal/DetailModal';
import EmptyState from './../EmptyState';

import { FONT_SIZE } from './../../theme';
import { HighlightedJson } from './../../utils';

import { HEX_PREVIEW_BYTES, formatBytesHex, formatBytesHexFull, stringifyValue } from './format';

const MONOSPACE_FONT = "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace";

export default function EntryDetailModal({ entry, onClose, tableCode }) {
  const value = entry.value;
  const isBytes = value instanceof Uint8Array;
  const isEmpty = value === null || value === undefined;

  const bytesPreview = useMemo(() => isBytes ? formatBytesHex(value) : null, [isBytes, value]);
  const json = useMemo(() => !isBytes && !isEmpty ? stringifyValue(value) : null, [isBytes, isEmpty, value]);

  const copyText = useMemo(
    () => isBytes ? (bytesPreview.hex ? formatBytesHexFull(value) : null) : json,
    [isBytes, bytesPreview, value, json]
  );

  return (
    <DetailModal
      chipLabel={tableCode}
      copyText={copyText}
      onClose={onClose}
      subtitle={entry.key ? `${entry.key} · slot=${entry.id}` : `slot=${entry.id}`}
    >
      {isEmpty ? (
        <Box display='flex' height='100%'>
          <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='No value' />
        </Box>
      ) : isBytes ? (
        <>
          <Typography sx={{ color: 'text.secondary', fontSize: FONT_SIZE.xs, mb: 1 }}>
            {value.length.toLocaleString('en-US')} bytes{bytesPreview.truncated ? ` (showing first ${HEX_PREVIEW_BYTES})` : ''}
          </Typography>
          <pre style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: MONOSPACE_FONT, fontSize: FONT_SIZE.sm, lineHeight: 1.65, margin: 0 }}>
            {bytesPreview.hex}
          </pre>
        </>
      ) : (
        <pre style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: MONOSPACE_FONT, fontSize: FONT_SIZE.sm, lineHeight: 1.65, margin: 0 }}>
          <HighlightedJson json={json} />
        </pre>
      )}
    </DetailModal>
  );
}
