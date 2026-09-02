import { Box } from '@mui/material';

import { COLORS, FONT_SIZE } from './../../theme';

const ROW_STYLE = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  gap: 8,
  padding: '7px 12px',
  userSelect: 'none'
};

const ELLIPSIS_STYLE = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

function SlotRow({ isSelected, name, onClick, slot }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={(event) => {
        if (!isSelected) {
          event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={(event) => {
        if (!isSelected) {
          event.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      style={{ ...ROW_STYLE, backgroundColor: isSelected ? 'rgba(124,77,255,0.12)' : 'transparent' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...ELLIPSIS_STYLE, color: isSelected ? COLORS.accent : 'inherit', fontSize: FONT_SIZE.md, fontWeight: 600 }}>
          {name ?? `Slot ${slot}`}
        </div>
        {name !== null && (
          <div style={{ ...ELLIPSIS_STYLE, color: 'rgba(255,255,255,0.3)', fontSize: FONT_SIZE.xs }}>
            slot {slot}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SlotList({ onSelect, rows, selectedSlot }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', width: 260 }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {rows.map((row) => (
          <SlotRow
            key={row.slot}
            isSelected={row.slot === selectedSlot}
            name={row.name}
            onClick={() => onSelect(row.slot)}
            slot={row.slot}
          />
        ))}
      </Box>
    </Box>
  );
}
