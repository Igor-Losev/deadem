import { Download as DownloadIcon } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

const FILES = DemoFile.getAll().reverse();

const S3_BUCKET_URL = 'https://deadem.s3.us-east-1.amazonaws.com/deadlock/demos';

function formatSize(bytes) {
  if (!bytes) {
    return '-';
  }

  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

const ROW_SX = {
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' }
};

export default function Library() {
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table stickyHeader size='small'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', width: 40 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Match</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Game Build</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mode</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: 60 }} align='center'>Link</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {FILES.map((file, index) => (
            <TableRow key={`${file.id}-${file.source.code}`} sx={ROW_SX}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
