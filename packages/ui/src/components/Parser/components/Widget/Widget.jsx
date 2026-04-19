import { Box, Divider, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from '../../theme';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function formatValue(value) {
  if (typeof value === 'number') {
    return (
      <span style={{ color: COLORS.jsonNumber, fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
        {value.toLocaleString('en-US')}
      </span>
    );
  }
  return value;
}

export default function Widget({ header, columns, data }) {
  return (
    <Box sx={{ border: 1, borderRadius: 1, borderColor: 'divider' }}>
      <Box paddingY={1} textAlign='center'>
        <Typography component='div' sx={{ fontSize: FONT_SIZE.lg, fontWeight: 600, color: COLORS.accent }}>{header}</Typography>
      </Box>

      <Divider />

      {data
        ? (
          <Table size='small'>
            <TableBody>
              {columns.map((column) => (
                <StyledTableRow key={column.label}>
                  <TableCell sx={{ color: 'text.secondary', fontSize: FONT_SIZE.md }}>{column.label}</TableCell>
                  <TableCell align='right' sx={{ fontSize: FONT_SIZE.md }}>{formatValue(column.selector(data))}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState text='No data' />
        )
      }
    </Box>
  );
}

