import { Close as CloseIcon, ContentCopy as ContentCopyIcon, Search as SearchIcon, SortByAlpha as SortByAlphaIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { COLORS, FONT_MONO, FONT_SIZE, TYPE_BADGE_STYLE } from './../../theme';
import { jsonReplacer } from './../../utils';

import { isHandleField } from './entities';

const HEADER_SURFACE_SX = { backgroundColor: 'rgba(255,255,255,0.025)', height: 44 };

const HANDLE_LINK_STYLE = {
  color: COLORS.jsonNumber,
  cursor: 'pointer',
  fontVariantNumeric: 'tabular-nums',
  textDecoration: 'underline dashed rgba(105,240,174,0.45)',
  textUnderlineOffset: 3
};

const ROW_STYLE = {
  alignItems: 'baseline',
  display: 'flex',
  gap: 6,
  lineHeight: '22px',
  padding: '2px 8px',
  whiteSpace: 'nowrap'
};

function formatValue(value) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>;
  }

  if (typeof value === 'bigint') {
    return <span style={{ color: COLORS.jsonNumber }}>{value.toString()}n</span>;
  }

  if (typeof value === 'boolean') {
    return <span style={{ color: COLORS.jsonBoolean }}>{String(value)}</span>;
  }

  if (typeof value === 'number') {
    return <span style={{ color: COLORS.jsonNumber, fontVariantNumeric: 'tabular-nums' }}>{String(value)}</span>;
  }

  if (typeof value === 'string') {
    if (value === '') {
      return <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>;
    }

    return <span style={{ color: COLORS.jsonString }}>{value}</span>;
  }

  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    const items = Array.isArray(value) ? value : Array.from(value);

    return (
      <span style={{ color: COLORS.jsonNumber }}>
        [{items.map((item, i) => (
          <span key={i}>
            {i > 0 && ', '}
            {typeof item === 'bigint' ? `${item.toString()}n` : typeof item === 'string' ? `"${item}"` : String(item)}
          </span>
        ))}]
      </span>
    );
  }

  return (
    <span style={{ color: 'rgba(255,255,255,0.7)' }}>
      {JSON.stringify(value, jsonReplacer)}
    </span>
  );
}

export default function EntityDetails({ entity, typedFields, copied, onCopy, onHandleClick }) {
  const [sortAlpha, setSortAlpha] = useState(false);
  const [filter, setFilter] = useState('');

  const trimmedFilter = filter.trim();

  const fields = useMemo(() => {
    let result = typedFields;

    if (trimmedFilter) {
      const lower = trimmedFilter.toLowerCase();

      result = typedFields.filter((field) => field.key.toLowerCase().includes(lower));
    }

    if (sortAlpha) {
      result = [...result].sort((left, right) => left.key.localeCompare(right.key));
    }

    return result;
  }, [typedFields, sortAlpha, trimmedFilter]);

  return (
    <>
      <Box alignItems='center' display='flex' justifyContent='space-between' px={1} sx={HEADER_SURFACE_SX}>
        <Typography color='text.secondary' fontSize={FONT_SIZE.md} fontWeight={600} noWrap>
          {entity.class.name}
          <Typography component='span' color='text.disabled' fontSize={FONT_SIZE.md}>
            {' '}/ index={entity.index}
          </Typography>
        </Typography>
        <Box alignItems='center' display='flex' gap={0.5}>
          <Typography color='text.disabled' fontSize={FONT_SIZE.sm}>
            {trimmedFilter ? `${fields.length.toLocaleString('en-US')} / ${typedFields.length.toLocaleString('en-US')} fields` : `${fields.length.toLocaleString('en-US')} fields`}
          </Typography>
          <Tooltip title={sortAlpha ? 'Natural order' : 'Sort alphabetically'} arrow>
            <IconButton onClick={() => setSortAlpha((value) => !value)} size='small'>
              <SortByAlphaIcon sx={{ color: sortAlpha ? COLORS.accent : 'text.disabled', fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? 'Copied!' : 'Copy JSON'} arrow>
            <IconButton onClick={onCopy} size='small'>
              <ContentCopyIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      <Box alignItems='center' display='flex' px={1} sx={{ backgroundColor: HEADER_SURFACE_SX.backgroundColor, height: 40 }}>
        <TextField
          fullWidth
          onChange={(event) => setFilter(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Escape') setFilter(''); }}
          placeholder='Filter fields...'
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

      <Box flex={1} overflow='auto' py={0.5}>
        {fields.map((field) => (
          <div
            key={field.key}
            onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}
            style={ROW_STYLE}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.55)',
                flexShrink: 0,
                fontFamily: FONT_MONO,
                fontSize: FONT_SIZE.sm,
                whiteSpace: 'nowrap'
              }}
            >
              {field.key}
            </span>
            <span style={TYPE_BADGE_STYLE}>
              {field.type ?? '?'}
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: FONT_MONO,
                fontSize: FONT_SIZE.sm,
                minWidth: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {isHandleField(field) ? (
                <span
                  onClick={() => onHandleClick(field.value)}
                  style={HANDLE_LINK_STYLE}
                  title='Filter by this handle'
                >
                  {String(field.value)}
                </span>
              ) : formatValue(field.value)}
            </span>
          </div>
        ))}
      </Box>
    </>
  );
}
