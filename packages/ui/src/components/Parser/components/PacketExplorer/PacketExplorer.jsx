import { InboxOutlined as InboxOutlinedIcon, ManageSearch as ManageSearchIcon } from '@mui/icons-material';
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import DetailModal from './../DetailModal/DetailModal';
import EmptyState from './../EmptyState';

import { COLORS, FONT_MONO, FONT_SIZE } from '../../theme';
import { HighlightedJson, compare, jsonReplacer } from '../../utils';

const COLUMNS = [
  { header: 'Sequence', value: (packet) => packet.sequence, selector: (packet) => packet.sequence },
  { header: 'Tick', value: (packet) => packet.tick, selector: (packet) => packet.tick },
  { header: 'Type', value: (packet) => packet.type.code, selector: (packet) => packet.type.code }
];

const BREAKDOWN_LABEL_SX = {
  color: 'rgba(255,255,255,0.3)',
  fontSize: FONT_SIZE.xs,
  fontWeight: 400,
  letterSpacing: '0.02em',
  textTransform: 'uppercase'
};

const BREAKDOWN_ROW_SX = { alignItems: 'baseline', display: 'flex', gap: 3, px: 1.5 };

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
  }, jsonReplacer, 2);
}

function getMessageTypeSummary(packet) {
  const counts = new Map();
  const list = packet.data?.messagePackets ?? [];

  for (let i = 0; i < list.length; i++) {
    const code = list[i].type.code;

    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  return Array.from(counts, ([code, count]) => ({ code, count }))
    .sort((left, right) => right.count - left.count || left.code.localeCompare(right.code));
}

export default function PacketExplorer({ history }) {
  const [packet, setPacket] = useState(null);
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

  const handleModalClosed = () => setPacket(null);

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
              {COLUMNS.map((column) => {
                const value = column.selector(demoPacket);
                const hasMessages = column.header === 'Type' && demoPacket.type.heavy && (demoPacket.data?.messagePackets?.length ?? 0) > 0;

                if (!hasMessages) {
                  return <TableCell key={column.header}>{value}</TableCell>;
                }

                const summary = getMessageTypeSummary(demoPacket);

                return (
                  <TableCell key={column.header}>
                    <Tooltip
                      arrow
                      slotProps={{
                        popper: {
                          modifiers: [
                            { name: 'preventOverflow', options: { boundary: 'clippingParents', padding: 8 } },
                            { name: 'flip', options: { boundary: 'clippingParents', padding: 8 } }
                          ]
                        }
                      }}
                      title={
                        <Box sx={{ maxWidth: 360, minWidth: 240 }}>
                          <Box sx={{ ...BREAKDOWN_ROW_SX, borderBottom: '1px solid rgba(255,255,255,0.08)', py: 0.75 }}>
                            <Typography sx={{ ...BREAKDOWN_LABEL_SX, flex: 1 }}>Message</Typography>
                            <Typography sx={BREAKDOWN_LABEL_SX}>Count</Typography>
                          </Box>
                          <Box sx={{ maxHeight: 220, overflowY: 'auto', py: 0.5 }}>
                            {summary.map((row) => (
                              <Box key={row.code} sx={{ ...BREAKDOWN_ROW_SX, py: 0.375 }}>
                                <Typography
                                  title={row.code}
                                  sx={{ color: 'rgba(255,255,255,0.85)', flex: 1, fontFamily: FONT_MONO, fontSize: FONT_SIZE.sm, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                  {row.code}
                                </Typography>
                                <Typography sx={{ color: COLORS.jsonNumber, flexShrink: 0, fontFamily: FONT_MONO, fontSize: FONT_SIZE.sm, fontVariantNumeric: 'tabular-nums' }}>
                                  {row.count.toLocaleString('en-US')}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      }
                    >
                      <Box
                        component='span'
                        sx={{
                          borderBottom: '1px dashed',
                          borderColor: 'text.disabled',
                          '&:hover': { borderColor: 'text.secondary' }
                        }}
                      >
                        {value}
                      </Box>
                    </Tooltip>
                  </TableCell>
                );
              })}
              <TableCell align='center'>
                <IconButton onClick={() => setPacket(demoPacket)} sx={{ padding: '3px' }}>
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
        <DetailModal
          chipLabel={packet.type.code}
          copyText={stringifiedPacket}
          onClose={handleModalClosed}
          subtitle={`seq ${packet.sequence} / tick ${packet.tick}`}
        >
          <pre
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: FONT_MONO,
              fontSize: FONT_SIZE.sm,
              lineHeight: 1.65,
              margin: 0
            }}
          >
            {stringifiedPacket && <HighlightedJson json={stringifiedPacket} />}
          </pre>
        </DetailModal>
      )}
    </Table>
  );
}
