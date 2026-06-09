import { Box, Switch, Tooltip } from '@mui/material';

import { COLORS, FONT_SIZE } from './../../theme';

const ACTION_SX = { pr: 1 };
const TOGGLE_SX = {
  alignItems: 'center',
  backgroundColor: 'var(--freeze-background)',
  border: '1px solid var(--freeze-border)',
  borderRadius: '7px',
  color: 'var(--freeze-color)',
  cursor: 'pointer',
  display: 'inline-flex',
  gap: 0.75,
  height: 32,
  pl: 1.25,
  pr: 0.75,
  transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
  '&:hover': {
    backgroundColor: 'var(--freeze-hover-background)',
    borderColor: 'var(--freeze-hover-border)'
  }
};
const ACTIVE_SX = {
  '--freeze-background': 'rgba(179, 136, 255, 0.13)',
  '--freeze-border': 'rgba(179, 136, 255, 0.34)',
  '--freeze-color': COLORS.accent,
  '--freeze-hover-background': 'rgba(179, 136, 255, 0.17)',
  '--freeze-hover-border': 'rgba(179, 136, 255, 0.45)'
};
const INACTIVE_SX = {
  '--freeze-background': 'rgba(255, 255, 255, 0.025)',
  '--freeze-border': 'rgba(255, 255, 255, 0.08)',
  '--freeze-color': 'rgba(255, 255, 255, 0.55)',
  '--freeze-hover-background': 'rgba(255, 255, 255, 0.04)',
  '--freeze-hover-border': 'rgba(255, 255, 255, 0.14)'
};
const LABEL_SX = { fontSize: FONT_SIZE.sm, fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap' };
const SWITCH_SX = {
  height: 24,
  p: 0,
  width: 38,
  '& .MuiSwitch-switchBase': {
    p: '3px',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(14px)',
      '& + .MuiSwitch-track': {
        backgroundColor: 'rgba(179, 136, 255, 0.65)',
        opacity: 1
      }
    }
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
    height: 18,
    width: 18
  },
  '& .MuiSwitch-track': {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    boxSizing: 'border-box',
    opacity: 1
  }
};

export default function FreezeToggle({ frozen, onToggle }) {
  return (
    <Tooltip arrow title='Disables live UI re-rendering'>
      <Box alignItems='center' display='flex' sx={ACTION_SX}>
        <Box
          component='label'
          sx={[TOGGLE_SX, frozen ? ACTIVE_SX : INACTIVE_SX]}
        >
          <Box component='span' sx={LABEL_SX}>
            Freeze UI
          </Box>
          <Switch
            checked={frozen}
            onChange={onToggle}
            size='small'
            sx={SWITCH_SX}
          />
        </Box>
      </Box>
    </Tooltip>
  );
}
