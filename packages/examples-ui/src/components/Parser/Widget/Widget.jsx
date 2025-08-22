import { Box, Divider, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f1f1f1',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function Widget({ header, columns, data }) {
  return (
    <Box sx={{ border: 1, borderRadius: 1, borderColor: 'divider' }}>
      <Box paddingY={1} textAlign='center'>
        <Typography component='div' sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{header}</Typography>
      </Box>

      <Divider />

      {data
        ? <Table size='small'>
          <TableBody>
            {columns.map((column) => (
              <StyledTableRow key={column.label}>
                <TableCell width='50%'>{column.label}</TableCell>
                <TableCell width='50%'>{column.selector(data)}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        : <Box alignItems='center' display='flex' justifyContent='center' minHeight={60}>
          <Typography fontSize='0.875rem'>No data</Typography>
        </Box>
      }
    </Box>
  );
}

