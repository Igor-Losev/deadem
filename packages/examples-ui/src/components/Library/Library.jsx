import { Download as DownloadIcon } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

const FILES = DemoFile.getAll().reverse();

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  }
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
    <TableContainer component={Paper} elevation={0}>
      <Table aria-label='Demo files library' stickyHeader size='small'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, width: 40 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Match</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Game Build</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 60 }} align='center'>Link</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {FILES.map((file, index) => (
            <StyledTableRow key={`${file.id}-${file.source.code}`}>
              <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
              <TableCell>{file.id}</TableCell>
              <TableCell>{file.gameBuild ?? '-'}</TableCell>
              <TableCell>{file.source.code}</TableCell>
              <TableCell>{file.meta?.date ?? '-'}</TableCell>
              <TableCell>{file.meta?.mode ?? 'Normal'}</TableCell>
              <TableCell>{formatSize(file.meta?.size)}</TableCell>
              <TableCell align='center'>
                <Tooltip title='Download .dem file' arrow>
                  <IconButton
                    href={`${S3_BUCKET_URL}/${file.getFileName()}`}
                    size='small'
                    target='_blank'
                  >
                    <DownloadIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
