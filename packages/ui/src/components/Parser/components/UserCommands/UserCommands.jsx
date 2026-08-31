import { ContentCopy as ContentCopyIcon, Keyboard as KeyboardIcon, TouchApp as TouchAppIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { FONT_SIZE } from './../../theme';
import { jsonReplacer } from './../../utils';

import EmptyState from './../EmptyState';

import SlotList from './SlotList';
import StatePanel from './StatePanel';
import resolvePlayerName from './resolvePlayerName';

const HEADER_SURFACE_SX = { backgroundColor: 'rgba(255,255,255,0.025)', height: 44 };

export default function UserCommands({ contentVersion, demo }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    if (!demo) {
      return [];
    }

    return demo.getUserCommands().map((command) => ({
      command,
      name: resolvePlayerName(demo, command),
      slot: command.slot
    }));
  }, [demo, contentVersion]);

  const selected = selectedSlot !== null ? rows.find((row) => row.slot === selectedSlot) ?? null : null;

  const handleSelect = (slot) => {
    setSelectedSlot(slot);
    setCopied(false);
  };

  const handleCopyClicked = useCallback(() => {
    if (selected === null) {
      return;
    }

    navigator.clipboard.writeText(JSON.stringify(selected.command.state, jsonReplacer, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selected]);

  if (rows.length === 0) {
    return (
      <Box color='text.primary' display='flex' minHeight={0}>
        <EmptyState
          icon={<KeyboardIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
          text='No user commands at this tick'
        />
      </Box>
    );
  }

  return (
    <Box color='text.primary' display='flex' minHeight={0}>
      <SlotList onSelect={handleSelect} rows={rows} selectedSlot={selectedSlot} />

      <Divider orientation='vertical' flexItem />

      <Box display='flex' flex={1} flexDirection='column' minWidth={0} overflow='hidden'>
        {selected ? (
          <>
            <Box alignItems='center' display='flex' justifyContent='space-between' px={1.5} sx={HEADER_SURFACE_SX}>
              <Typography fontSize={FONT_SIZE.md} fontWeight={600}>
                {selected.name ?? `Slot ${selected.slot}`}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy JSON'} arrow>
                <IconButton onClick={handleCopyClicked} size='small'>
                  <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider />

            <StatePanel key={selected.slot} state={selected.command.state} />
          </>
        ) : (
          <EmptyState
            icon={<TouchAppIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
            text='Select a player to view the current input state'
          />
        )}
      </Box>
    </Box>
  );
}
