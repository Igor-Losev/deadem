import { Box, Divider, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

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
      <span style={{ color: '#69f0ae', fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
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
        <Typography component='div' sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#b388ff' }}>{header}</Typography>
      </Box>

      <Divider />

      {data
        ? (
          <Table size='small'>
            <TableBody>
              {columns.map((column) => (
                <StyledTableRow key={column.label}>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{column.label}</TableCell>
                  <TableCell align='right' sx={{ fontSize: '0.8125rem' }}>{formatValue(column.selector(data))}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box alignItems='center' display='flex' justifyContent='center' minHeight={60}>
            <Typography color='text.secondary' fontSize='0.875rem'>No data.</Typography>
          </Box>
        )
      }
    </Box>
  );
}

