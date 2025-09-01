import { Box, IconButton, Modal, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { ManageSearch as ManageSearchIcon } from '@mui/icons-material';
import { useMemo, useState } from 'react';

const COLUMNS = [
  {
    header: 'Sequence',
    selector: d => d.sequence
  },
  {
    header: 'Tick',
    selector: d => d.tick
  },
  {
    header: 'Type',
    selector: d => d.type.code
  }
];

export default function PacketExplorer({ history }) {
  const [packet, setPacket] = useState(null);

  const stringifiedPacket = useMemo(() => {
    if (packet === null) {
      return '';
    }

    let data;

    if (packet.type.heavy) {
      const hasMessages = packet.data.hasOwnProperty('messagePackets');
      const hasStringTables = packet.data.hasOwnProperty('stringTables');

      data = {
        ...hasMessages
          ? {
            messagePackets: packet.data.messagePackets.map(message => ({
              type: message.type.code,
              data: message.data
            }))
          }
          : {},
        ...hasStringTables
          ? {
            stringTables: packet.data.stringTables
          }
          : {}
      }
    } else {
      data = packet.data;
    }

    return JSON.stringify({
      sequence: packet.sequence,
      tick: packet.tick,
      type: packet.type.code,
      data
    }, null, 2);
  }, [packet]);

  const handleDataClicked = (demoPacket) => {
    setPacket(demoPacket);
  };

  const handleModalClosed = () => {
    setPacket(null);
  };

  return (
    <Table size='small' stickyHeader>
      <TableHead>
        <TableRow>
          {COLUMNS.map(column => (
            <TableCell key={column.header} sx={{ fontWeight: 'bold' }}>{column.header}</TableCell>
          ))}
          <TableCell align='center' sx={{ fontWeight: 'bold' }}>Data</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {history.length > 0 ? (
          history.map(demoPacket => (
            <TableRow key={demoPacket.sequence}>
              {COLUMNS.map(column => (
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
            <TableCell colSpan={COLUMNS.length + 1} sx={{ height: '120px', textAlign: 'center' }}>
              <Typography color='text.secondary' fontSize='0.875rem'>No data.</Typography>
            </TableCell>
          </TableRow>
        )}

      </TableBody>

      {packet &&
        <Modal
          open={true}
          onClose={handleModalClosed}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              left: '50%',
              maxHeight: '80vh',
              maxWidth: '80vw',
              outline: 'none',
              overflow: 'auto',
              p: 2,
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <pre>{stringifiedPacket}</pre>
          </Box>
        </Modal>
      }
    </Table>
  );
}

