import { Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

const FILES = DemoFile.getAll().reverse();

const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f1f1f1',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const S3_BUCKET_URL = 'https://deadem.s3.us-east-1.amazonaws.com/deadlock/demos';

function formatSize(bytes) {
  if (!bytes) {
    return '-';
  }

  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

export default function Library() {
  return (
    <TableContainer component={Paper}>
      <Table aria-label='files-table' stickyHeader size='small'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Match</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Game Build</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mode</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Link</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {FILES.map((file, index) => (
            <StyledTableRow key={`${file.id}-${file.source.code}`}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{file.id}</TableCell>
              <TableCell>{file.gameBuild ?? '-'}</TableCell>
              <TableCell>{file.source.code}</TableCell>
              <TableCell>{file.meta?.date ?? '-'}</TableCell>
              <TableCell>{file.meta?.mode ?? 'Normal'}</TableCell>
              <TableCell>{formatSize(file.meta?.size)}</TableCell>
              <TableCell>
                <Link href={`${S3_BUCKET_URL}/${file.getFileName()}`} target='_blank'>
                  Download
                </Link>
              </TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
