import { Box, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from '../../theme';

const HEADER_SURFACE_SX = {
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.025)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  height: 36,
  px: 1.5
};

const TABLE_SX = {
  '& td': { borderColor: 'rgba(255,255,255,0.06)', py: 0.75 },
  '& tr:last-of-type td': { borderBottom: 'none' }
};

const LABEL_SX = {
  color: 'text.secondary',
  fontSize: FONT_SIZE.sm,
  whiteSpace: 'nowrap'
};

const VALUE_SX = {
  fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace",
  fontSize: FONT_SIZE.sm,
  wordBreak: 'break-word'
};

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>;
  }

  if (typeof value !== 'number') {
    return <span style={{ color: COLORS.jsonString }}>{value}</span>;
  }

  return (
    <span style={{ color: COLORS.jsonNumber, fontVariantNumeric: 'tabular-nums' }}>
      {value.toLocaleString('en-US')}
    </span>
  );
}

export { formatValue };

export default function Widget({ header, columns, data, valueAlign = 'right' }) {
  return (
    <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
      <Box sx={HEADER_SURFACE_SX}>
        <Typography sx={{ color: COLORS.accent, fontSize: FONT_SIZE.md, fontWeight: 600 }}>
          {header}
        </Typography>
      </Box>

      {data ? (
        <Table size='small' sx={TABLE_SX}>
          <TableBody>
            {columns.map((column) => (
              <TableRow key={column.label}>
                <TableCell sx={LABEL_SX}>{column.label}</TableCell>
                <TableCell align={valueAlign} sx={VALUE_SX}>
                  {column.format
                    ? column.format(column.selector(data))
                    : formatValue(column.selector(data))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState text='No data' />
      )}
    </Box>
  );
}
