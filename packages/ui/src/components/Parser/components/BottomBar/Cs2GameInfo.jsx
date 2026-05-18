import { Box, Typography } from '@mui/material';

import { FONT_SIZE } from '../../theme';

const TEAM_T = 2;
const TEAM_CT = 3;

const COLOR_T = '#ffa726';
const COLOR_CT = '#42a5f5';

function readTeams(demo) {
  if (!demo) {
    return null;
  }

  const teams = demo.getEntitiesByClassName('CCSTeam').map((entity) => entity.unpackFlattened());

  const teamT = teams.find((team) => team.m_iTeamNum === TEAM_T);
  const teamCT = teams.find((team) => team.m_iTeamNum === TEAM_CT);

  if (!teamT || !teamCT) {
    return null;
  }

  return { teamT, teamCT };
}

function TeamLabel({ color, mirrored = false, name, score }) {
  return (
    <Box
      alignItems='baseline'
      display='flex'
      flex={1}
      flexDirection={mirrored ? 'row-reverse' : 'row'}
      gap={1}
      justifyContent='flex-end'
      minWidth={0}
      overflow='hidden'
    >
      <Typography
        color='text.secondary'
        fontSize={FONT_SIZE.sm}
        sx={{
          minWidth: 0,
          overflow: 'hidden',
          textAlign: mirrored ? 'left' : 'right',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {name}
      </Typography>
      <Typography fontSize={FONT_SIZE.lg} fontWeight={700} sx={{ color, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{score}</Typography>
    </Box>
  );
}

export default function Cs2GameInfo({ demo, mapName }) {
  const teams = readTeams(demo);

  if (teams === null) {
    return null;
  }

  return (
    <Box
      alignItems='center'
      display='flex'
      gap={2}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: '32px',
        minWidth: 0,
        px: 2
      }}
    >
      <TeamLabel
        color={COLOR_T}
        name={teams.teamT.m_szClanTeamname || 'T'}
        score={teams.teamT.m_iScore ?? 0}
      />

      <Typography
        color='text.secondary'
        fontSize={FONT_SIZE.sm}
        sx={{
          flex: '0 1 160px',
          letterSpacing: '0.05em',
          minWidth: 48,
          overflow: 'hidden',
          textAlign: 'center',
          textOverflow: 'ellipsis',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}
      >
        {mapName || '—'}
      </Typography>

      <TeamLabel
        color={COLOR_CT}
        mirrored
        name={teams.teamCT.m_szClanTeamname || 'CT'}
        score={teams.teamCT.m_iScore ?? 0}
      />
    </Box>
  );
}
