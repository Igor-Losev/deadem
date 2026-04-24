import {
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  InboxOutlined as InboxOutlinedIcon,
  ManageSearch as ManageSearchIcon
} from '@mui/icons-material';
import { Box, Chip, IconButton, Modal, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from '../../theme';
import { HighlightedJson, compare } from '../../utils';

const COLUMNS = [
  { header: 'Sequence', value: (packet) => packet.sequence, selector: (packet) => packet.sequence },
  { header: 'Tick', value: (packet) => packet.tick, selector: (packet) => packet.tick },
  { header: 'Type', value: (packet) => packet.type.code, selector: (packet) => packet.type.code }
];

function stringifyPacket(packet) {
  let data;

  if (packet.type.heavy) {
    const hasMessages = Object.hasOwn(packet.data, 'messagePackets');
    const hasStringTables = Object.hasOwn(packet.data, 'stringTables');

    data = {
      ...hasMessages && {
        messagePackets: packet.data.messagePackets.map((message) => ({
          type: message.type.code,
          data: message.data
        }))
      },
      ...hasStringTables && { stringTables: packet.data.stringTables }
    };
  } else {
    data = packet.data;
  }

  return JSON.stringify({
    sequence: packet.sequence,
    tick: packet.tick,
    type: packet.type.code,
    data
  }, null, 2);
}

export default function PacketExplorer({ history }) {
  const [packet, setPacket] = useState(null);
  const [copied, setCopied] = useState(false);
  const [orderBy, setOrderBy] = useState('Tick');
  const [order, setOrder] = useState('desc');

  const sorted = useMemo(() => {
    const column = COLUMNS.find((item) => item.header === orderBy);

    return [...history].sort((left, right) => {
      const comparison = compare(column.value(left), column.value(right));

      return order === 'asc' ? comparison : -comparison;
    });
  }, [history, orderBy, order]);

  const stringifiedPacket = useMemo(() => packet === null ? '' : stringifyPacket(packet), [packet]);

  const handleDataClicked = (demoPacket) => {
    setPacket(demoPacket);
    setCopied(false);
  };

  const handleModalClosed = () => setPacket(null);

  const handleCopyClicked = useCallback(() => {
    navigator.clipboard.writeText(stringifiedPacket).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [stringifiedPacket]);

  const handleSort = (header) => {
    if (orderBy === header) {
      setOrder((previous) => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setOrderBy(header);
    setOrder('asc');
  };

  return (
    <Table size='small' stickyHeader>
      <TableHead>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableCell key={column.header} sx={{ fontWeight: 'bold' }}>
              <TableSortLabel
                active={orderBy === column.header}
                direction={orderBy === column.header ? order : 'asc'}
                onClick={() => handleSort(column.header)}
              >
                {column.header}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align='center' sx={{ fontWeight: 'bold' }}>Data</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sorted.length > 0 ? (
          sorted.map((demoPacket) => (
            <TableRow key={demoPacket.sequence}>
              {COLUMNS.map((column) => (
                <TableCell key={column.header}>{column.selector(demoPacket)}</TableCell>
              ))}
              <TableCell align='center'>
                <IconButton onClick={() => handleDataClicked(demoPacket)} sx={{ padding: '3px' }}>
                  <ManageSearchIcon fontSize='small' />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={COLUMNS.length + 1}>
              <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='No data' />
            </TableCell>
          </TableRow>
        )}
      </TableBody>

      {packet && (
        <Modal open onClose={handleModalClosed}>
          <Box
            sx={{
              backgroundColor: '#151522',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              left: '50%',
              maxHeight: '80vh',
              maxWidth: '90vw',
              minHeight: 200,
              minWidth: 320,
              outline: 'none',
              overflow: 'hidden',
              position: 'absolute',
              resize: 'both',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 720
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#1e1e2e',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                px: 2,
                py: 1
              }}
            >
              <Box display='flex' alignItems='center' gap={1}>
                <Chip
                  label={packet.type.code}
                  size='small'
                  sx={{
                    backgroundColor: 'rgba(124, 77, 255, 0.2)',
                    color: COLORS.accent,
                    fontSize: FONT_SIZE.xs,
                    fontWeight: 600,
                    height: 22
                  }}
                />
                <Typography sx={{ color: 'text.secondary', fontSize: FONT_SIZE.xs }}>
                  seq {packet.sequence} / tick {packet.tick}
                </Typography>
              </Box>
              <Box display='flex' alignItems='center' gap={0.25}>
                <Tooltip title={copied ? 'Copied!' : 'Copy'} arrow>
                  <IconButton
                    onClick={handleCopyClicked}
                    size='small'
                    sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
                  >
                    <ContentCopyIcon sx={{ fontSize: FONT_SIZE.lg }} />
                  </IconButton>
                </Tooltip>
                <IconButton
                  onClick={handleModalClosed}
                  size='small'
                  sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
                >
                  <CloseIcon sx={{ fontSize: '0.95rem' }} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ backgroundColor: '#151522', flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
              <pre
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
                  fontSize: FONT_SIZE.sm,
                  lineHeight: 1.65,
                  margin: 0
                }}
              >
                {stringifiedPacket && <HighlightedJson json={stringifiedPacket} />}
              </pre>
            </Box>
          </Box>
        </Modal>
      )}
    </Table>
  );
}
