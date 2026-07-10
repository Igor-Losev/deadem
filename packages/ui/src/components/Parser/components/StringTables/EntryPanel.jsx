import { Close as CloseIcon, Search as SearchIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';
import { Box, Divider, InputAdornment, TextField } from '@mui/material';
import { useLayoutEffect, useMemo, useState } from 'react';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from './../../theme';
import { HighlightedJson } from './../../utils';

import EntryDetailModal from './EntryDetailModal';

import { VALUE_COLOR_BY_KIND, getValuePreview } from './format';

const HEADER_SURFACE_SX = { backgroundColor: 'rgba(255,255,255,0.025)', height: 44 };
const ROW_HEIGHT = 28;
const OVERSCAN = 10;
const COLUMN_GAP = 10;
const ID_COLUMN_WIDTH = 44;
const COLUMN_MIN_CHARS = 6;
const COLUMN_MAX_CHARS = 64;
const COLUMN_PADDING_CHARS = 1;

const COLUMN_HEADER_STYLE = {
  color: 'rgba(255,255,255,0.3)',
  flexShrink: 0,
  fontSize: FONT_SIZE.xs,
  fontWeight: 400,
  letterSpacing: '0.02em',
  textTransform: 'uppercase'
};

function EntryRow({ entry, keyColumnStyle, onClick, style, valueColumnStyle }) {
  const preview = getValuePreview(entry.value);

  return (
    <div
      onClick={onClick}
      onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}
      style={{
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        gap: COLUMN_GAP,
        padding: '0 12px',
        ...style
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, fontFamily: 'monospace', fontSize: FONT_SIZE.sm, width: ID_COLUMN_WIDTH }}>
        {entry.id}
      </span>
      <span
        style={{
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'monospace',
          fontSize: FONT_SIZE.sm,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...keyColumnStyle
        }}
      >
        {entry.key || '—'}
      </span>
      <span
        style={{
          color: preview.kind === 'object' ? undefined : VALUE_COLOR_BY_KIND[preview.kind],
          fontFamily: 'monospace',
          fontSize: FONT_SIZE.sm,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...valueColumnStyle
        }}
      >
        {preview.kind === 'object' ? <HighlightedJson json={preview.text} /> : preview.text}
      </span>
    </div>
  );
}

export default function EntryPanel({ contentVersion, table }) {
  const [filter, setFilter] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const [scrollNode, setScrollNode] = useState(null);

  const handleFilterChanged = (event) => {
    setFilter(event.target.value);
    setScrollTop(0);

    if (scrollNode) {
      scrollNode.scrollTop = 0;
    }
  };

  useLayoutEffect(() => {
    if (scrollNode === null) {
      return undefined;
    }

    setViewportHeight(scrollNode.clientHeight);

    const observer = new ResizeObserver(([observed]) => setViewportHeight(observed.contentRect.height));

    observer.observe(scrollNode);

    return () => observer.disconnect();
  }, [scrollNode]);

  const entries = useMemo(() => table.getEntries(), [table, contentVersion]);

  const keyColumnChars = useMemo(() => {
    const longest = entries.reduce((max, entry) => Math.max(max, (entry.key || '—').length), COLUMN_MIN_CHARS);

    return Math.min(longest, COLUMN_MAX_CHARS) + COLUMN_PADDING_CHARS;
  }, [entries]);

  const valueColumnChars = useMemo(() => {
    const longest = entries.reduce((max, entry) => Math.max(max, getValuePreview(entry.value).text.length), COLUMN_MIN_CHARS);

    return Math.min(longest, COLUMN_MAX_CHARS) + COLUMN_PADDING_CHARS;
  }, [entries]);

  const keyColumnStyle = { flex: `0 1 ${keyColumnChars}ch`, minWidth: `${COLUMN_MIN_CHARS}ch` };
  const valueColumnStyle = { flex: `1 1 ${valueColumnChars}ch`, minWidth: `${COLUMN_MIN_CHARS}ch` };

  const trimmedFilter = filter.trim();
  const idFilter = /^\d+$/.test(trimmedFilter) ? trimmedFilter : null;

  const filteredEntries = useMemo(() => {
    if (!trimmedFilter) {
      return entries;
    }

    if (idFilter !== null) {
      return entries.filter((entry) => String(entry.id).startsWith(idFilter));
    }

    const lower = trimmedFilter.toLowerCase();

    return entries.filter((entry) => entry.key.toLowerCase().includes(lower));
  }, [entries, trimmedFilter, idFilter]);

  const selectedEntry = selectedEntryId !== null ? table.getEntryById(selectedEntryId) : null;

  const total = filteredEntries.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(total, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);
  const visibleEntries = filteredEntries.slice(startIndex, endIndex);

  return (
    <>
      <Box alignItems='center' display='flex' px={1} sx={HEADER_SURFACE_SX}>
        <TextField
          fullWidth
          onChange={handleFilterChanged}
          onKeyDown={(event) => { if (event.key === 'Escape') setFilter(''); }}
          placeholder='Filter by key or id...'
          size='small'
          slotProps={{
            input: {
              endAdornment: trimmedFilter ? (
                <InputAdornment position='end'>
                  <CloseIcon
                    onClick={() => setFilter('')}
                    sx={{ color: 'text.disabled', cursor: 'pointer', fontSize: '1rem' }}
                  />
                </InputAdornment>
              ) : null,
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: { fontSize: FONT_SIZE.md, height: 32 }
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              '&.Mui-focused fieldset': { borderColor: COLORS.jsonBoolean }
            }
          }}
          value={filter}
        />
      </Box>
      <Divider />

      <Box
        alignItems='center'
        display='flex'
        gap={`${COLUMN_GAP}px`}
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          height: 24,
          px: 1.5
        }}
      >
        <span style={{ ...COLUMN_HEADER_STYLE, width: ID_COLUMN_WIDTH }}>Slot</span>
        <span style={{ ...COLUMN_HEADER_STYLE, ...keyColumnStyle }}>Key</span>
        <span style={{ ...COLUMN_HEADER_STYLE, ...valueColumnStyle }}>Value</span>
      </Box>

      {total === 0 ? (
        <EmptyState
          icon={<SearchOffIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
          text={entries.length === 0 ? 'No entries' : 'No entries match your filter'}
        />
      ) : (
        <Box onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)} ref={setScrollNode} sx={{ flex: 1, overflow: 'auto' }}>
          <div style={{ height: total * ROW_HEIGHT, position: 'relative' }}>
            {visibleEntries.map((entry, index) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                keyColumnStyle={keyColumnStyle}
                onClick={() => setSelectedEntryId(entry.id)}
                style={{ height: ROW_HEIGHT, left: 0, position: 'absolute', right: 0, top: (startIndex + index) * ROW_HEIGHT }}
                valueColumnStyle={valueColumnStyle}
              />
            ))}
          </div>
        </Box>
      )}

      {selectedEntry && (
        <EntryDetailModal entry={selectedEntry} onClose={() => setSelectedEntryId(null)} tableCode={table.type.code} />
      )}
    </>
  );
}
