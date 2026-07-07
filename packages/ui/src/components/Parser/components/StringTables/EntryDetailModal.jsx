import { Close as CloseIcon, ContentCopy as ContentCopyIcon, InboxOutlined as InboxOutlinedIcon } from '@mui/icons-material';
import { Box, Chip, IconButton, Modal, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from './../../theme';
import { HighlightedJson } from './../../utils';

import { HEX_PREVIEW_BYTES, formatBytesHex, formatBytesHexFull, stringifyValue } from './format';

const MONOSPACE_FONT = "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace";

export default function EntryDetailModal({ entry, onClose, tableCode }) {
  const [copied, setCopied] = useState(false);

  const value = entry.value;
  const isBytes = value instanceof Uint8Array;
  const isEmpty = value === null || value === undefined;

  const bytesPreview = useMemo(() => isBytes ? formatBytesHex(value) : null, [isBytes, value]);
  const json = useMemo(() => !isBytes && !isEmpty ? stringifyValue(value) : null, [isBytes, isEmpty, value]);

  const canCopy = isBytes ? Boolean(bytesPreview.hex) : Boolean(json);

  const handleCopyClicked = useCallback(() => {
    if (!canCopy) {
      return;
    }

    const text = isBytes ? formatBytesHexFull(value) : json;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [canCopy, isBytes, value, json]);

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          backgroundColor: '#151522',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          left: '50%',
          maxHeight: '80vh',
          maxWidth: '90vw',
          minHeight: 200,
          minWidth: 320,
          outline: 'none',
          overflow: 'hidden',
          position: 'absolute',
          resize: 'both',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#1e1e2e',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            px: 2,
            py: 1
          }}
        >
          <Box alignItems='center' display='flex' gap={1} minWidth={0}>
            <Chip
              label={tableCode}
              size='small'
              sx={{
                backgroundColor: 'rgba(124, 77, 255, 0.2)',
                color: COLORS.accent,
                flexShrink: 0,
                fontSize: FONT_SIZE.xs,
                fontWeight: 600,
                height: 22
              }}
            />
            <Typography sx={{ color: 'text.secondary', fontSize: FONT_SIZE.xs, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.key ? `${entry.key} · slot=${entry.id}` : `slot=${entry.id}`}
            </Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.25}>
            {canCopy && (
              <Tooltip title={copied ? 'Copied!' : 'Copy'} arrow>
                <IconButton
                  onClick={handleCopyClicked}
                  size='small'
                  sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
                >
                  <ContentCopyIcon sx={{ fontSize: FONT_SIZE.lg }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              onClick={onClose}
              size='small'
              sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
            >
              <CloseIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ backgroundColor: '#151522', flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
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
        </Box>
      </Box>
    </Modal>
  );
}
