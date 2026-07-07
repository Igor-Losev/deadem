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

function TableRow({ isSelected, onClick, table }) {
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
          {table.type.code}
        </div>
        <div style={{ ...ELLIPSIS_STYLE, color: 'rgba(255,255,255,0.3)', fontSize: FONT_SIZE.xs }}>
          {table.type.name}
        </div>
      </div>
      <span
        style={{
          backgroundColor: `${COLORS.entityClass}22`,
          borderRadius: 8,
          color: COLORS.entityClass,
          flexShrink: 0,
          fontSize: FONT_SIZE.xs,
          fontWeight: 600,
          lineHeight: '18px',
          padding: '0 5px'
        }}
      >
        {table.getEntriesCount().toLocaleString('en-US')}
      </span>
    </div>
  );
}

export default function TableList({ onSelect, selectedTableId, tables }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', width: 260 }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tables.map((table) => (
          <TableRow
            key={table.id}
            isSelected={table.id === selectedTableId}
            onClick={() => onSelect(table.id)}
            table={table}
          />
        ))}
      </Box>
    </Box>
  );
}
