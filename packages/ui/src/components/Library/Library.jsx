import { Download as DownloadIcon } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';

import DemoFile from '@deadem/examples-common/data/DemoFile.js';

const FILES = DemoFile.getAll().reverse();

const S3_BUCKET_URL = 'https://deadem.s3.us-east-1.amazonaws.com/deadlock/demos';

function formatSize(bytes) {
  if (!bytes) {
    return '-';
  }

  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

const COLUMNS = [
  { key: 'id', label: 'Match', getValue: (file) => file.id },
  { key: 'game', label: 'Game', getValue: (file) => file.game.code, renderValue: (file) => file.game.code.toUpperCase() },
  { key: 'gameBuild', label: 'Game Build', getValue: (file) => file.gameBuild ?? -1, renderValue: (file) => file.gameBuild ?? '-' },
  { key: 'source', label: 'Source', getValue: (file) => file.source.code, renderValue: (file) => file.source.code },
  { key: 'date', label: 'Date', getValue: (file) => file.meta?.date ?? '', renderValue: (file) => file.meta?.date ?? '-' },
  { key: 'mode', label: 'Mode', getValue: (file) => file.meta?.mode ?? 'Normal', renderValue: (file) => file.meta?.mode ?? 'Normal' },
  { key: 'size', label: 'Size', getValue: (file) => file.meta?.size ?? -1, renderValue: (file) => formatSize(file.meta?.size) }
];

const ROW_SX = {
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' }
};

export default function Library() {
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const files = useMemo(() => {
    const column = COLUMNS.find((item) => item.key === sortBy) ?? COLUMNS[0];
    const direction = sortDirection === 'asc' ? 1 : -1;

    return [...FILES].sort((left, right) => {
      const leftValue = column.getValue(left);
      const rightValue = column.getValue(right);

      if (leftValue < rightValue) {
        return -1 * direction;
      }

      if (leftValue > rightValue) {
        return 1 * direction;
      }

      return right.id - left.id;
    });
  }, [sortBy, sortDirection]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortBy(columnKey);
    setSortDirection(columnKey === 'date' ? 'desc' : 'asc');
  };

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table stickyHeader size='small'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', width: 40 }}>#</TableCell>
            {COLUMNS.map((column) => (
              <TableCell
                key={column.key}
                sortDirection={sortBy === column.key ? sortDirection : false}
                sx={{ fontWeight: 'bold' }}
              >
                <TableSortLabel
                  active={sortBy === column.key}
                  direction={sortBy === column.key ? sortDirection : 'asc'}
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell align='center' sx={{ fontWeight: 'bold', width: 60 }}>Link</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {files.map((file, index) => (
            <TableRow key={`${file.id}-${file.source.code}`} sx={ROW_SX}>
              <TableCell sx={{ color: 'text.secondary' }}>{index + 1}</TableCell>
              {COLUMNS.map((column) => (
                <TableCell key={column.key}>
                  {column.renderValue ? column.renderValue(file) : column.getValue(file)}
                </TableCell>
              ))}
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
