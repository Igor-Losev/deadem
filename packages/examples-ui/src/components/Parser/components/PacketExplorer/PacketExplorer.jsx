import { Box, Chip, Divider, IconButton, Modal, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Close as CloseIcon, ContentCopy as ContentCopyIcon, ManageSearch as ManageSearchIcon } from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';

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

function highlightJson(json) {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*(:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?\b)/g,
    (match, str, colon, bool, num) => {
      if (str && colon) {
        return `<span style="color:#0451a5">${str}</span>:`;
      }
      if (str) {
        return `<span style="color:#a31515">${str}</span>`;
      }
      if (bool) {
        return `<span style="color:#0000ff">${bool}</span>`;
      }
      if (num) {
        return `<span style="color:#098658">${num}</span>`;
      }
      return match;
    }
  );
}

export default function PacketExplorer({ history }) {
  const [packet, setPacket] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const highlightedJson = useMemo(() => {
    if (!stringifiedPacket) return '';
    return highlightJson(stringifiedPacket);
  }, [stringifiedPacket]);

  const handleDataClicked = (demoPacket) => {
    setPacket(demoPacket);
    setCopied(false);
  };

  const handleModalClosed = () => {
    setPacket(null);
  };

  const handleCopyClicked = useCallback(() => {
    navigator.clipboard.writeText(stringifiedPacket).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [stringifiedPacket]);

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
              borderRadius: '8px',
              left: '50%',
              maxHeight: '80vh',
              maxWidth: '720px',
              width: '90vw',
              outline: 'none',
              overflow: 'hidden',
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
              }}
            >
              <Box display='flex' alignItems='center' gap={1}>
                <Chip
                  label={packet.type.code}
                  size='small'
                  sx={{
                    backgroundColor: '#e0e0e0',
                    color: 'text.primary',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    height: 22,
                  }}
                />
                <Typography sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
                  seq {packet.sequence} / tick {packet.tick}
                </Typography>
              </Box>
              <Box display='flex' alignItems='center' gap={0.25}>
                <Tooltip title={copied ? 'Copied!' : 'Copy'} arrow>
                  <IconButton onClick={handleCopyClicked} size='small' sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
                    <ContentCopyIcon sx={{ fontSize: '0.875rem' }} />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={handleModalClosed} size='small' sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
                  <CloseIcon sx={{ fontSize: '0.95rem' }} />
                </IconButton>
              </Box>
            </Box>

            <Box
              sx={{
                backgroundColor: '#fafafa',
                overflow: 'auto',
                px: 2.5,
                py: 2,
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  lineHeight: 1.65,
                  fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
                  color: '#1e1e1e',
                }}
                dangerouslySetInnerHTML={{ __html: highlightedJson }}
              />
            </Box>
          </Box>
        </Modal>
      }
    </Table>
  );
}
