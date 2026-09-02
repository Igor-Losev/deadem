import { Box } from '@mui/material';

import { COLORS, FONT_MONO, FONT_SIZE } from './../../theme';

const KEY_WIDTH = 200;
const KEY_WIDTH_MIN = 90;
const INDENT = 16;

const DIM = 'rgba(255,255,255,0.4)';

const GROUP_STYLE = {
  borderLeft: '1px solid rgba(255,255,255,0.08)',
  marginLeft: 6,
  paddingLeft: 10
};

const ROW_SX = {
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
  display: 'flex',
  gap: 1,
  paddingY: '1px'
};

function formatScalar(value) {
  if (typeof value === 'string') {
    return { color: COLORS.jsonString, text: value };
  }

  if (typeof value === 'boolean') {
    return { color: COLORS.jsonBoolean, text: String(value) };
  }

  if (typeof value === 'number') {
    return { color: COLORS.jsonNumber, text: Number.isInteger(value) ? value.toLocaleString('en-US') : value.toFixed(4) };
  }

  if (value instanceof Uint8Array) {
    return {
      color: DIM,
      text: value.length === 0 ? 'empty' : Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join(' ')
    };
  }

  if (value !== null && typeof value === 'object') {
    return { color: DIM, text: 'empty' };
  }

  return { color: DIM, text: String(value) };
}

function formatBits(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }

  const mask = BigInt(value);
  const bits = [];

  for (let bit = 0n; bit < 64n; bit++) {
    if ((mask >> bit) & 1n) {
      bits.push(bit.toString());
    }
  }

  return bits.length === 0 ? null : `bits: ${bits.join(', ')}`;
}

function Leaf({ depth, name, value }) {
  const scalar = formatScalar(value);
  const bits = name.startsWith('buttonstate') ? formatBits(value) : null;

  return (
    <Box sx={ROW_SX}>
      <span style={{ color: 'rgba(255,255,255,0.55)', flexShrink: 0, width: Math.max(KEY_WIDTH - depth * INDENT, KEY_WIDTH_MIN) }}>
        {name}
      </span>
      <span style={{ color: scalar.color, minWidth: 0, overflowWrap: 'anywhere' }}>
        {scalar.text}
      </span>
      {bits !== null && <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{bits}</span>}
    </Box>
  );
}

function Node({ depth, name, value }) {
  const isBranch = value !== null && typeof value === 'object' && !(value instanceof Uint8Array);

  if (!isBranch) {
    return <Leaf depth={depth} name={name} value={value} />;
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [ `[${index}]`, item ])
    : Object.entries(value);

  if (entries.length === 0) {
    return <Leaf depth={depth} name={name} value={value} />;
  }

  return (
    <Box sx={{ marginTop: depth === 0 ? 1.25 : 0.5 }}>
      <div style={{ color: COLORS.jsonKey, fontWeight: 600 }}>
        {name}
        <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>
          {Array.isArray(value) ? ` [${entries.length}]` : ''}
        </span>
      </div>

      <div style={GROUP_STYLE}>
        {entries.map(([ key, item ]) => (
          <Node key={key} depth={depth + 1} name={key} value={item} />
        ))}
      </div>
    </Box>
  );
}

export default function StatePanel({ state }) {
  return (
    <Box sx={{ flex: 1, fontFamily: FONT_MONO, fontSize: FONT_SIZE.sm, lineHeight: 1.6, overflow: 'auto', padding: '4px 14px 14px' }}>
      {Object.entries(state).map(([ key, value ]) => (
        <Node key={key} depth={0} name={key} value={value} />
      ))}
    </Box>
  );
}
