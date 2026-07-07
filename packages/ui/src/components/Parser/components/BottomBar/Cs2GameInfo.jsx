import { Box, Typography } from '@mui/material';

import { FONT_SIZE } from '../../theme';

const TEAM_T = 2;
const TEAM_CT = 3;

const COLOR_T = '#ffa726';
const COLOR_CT = '#42a5f5';

function readTeam(entity) {
  return {
    m_iScore: entity.getField('m_iScore'),
    m_szClanTeamname: entity.getField('m_szClanTeamname')
  };
}

function readTeams(demo) {
  if (!demo) {
    return null;
  }

  let teamT = null;
  let teamCT = null;

  for (const entity of demo.getEntitiesByClassNameIterator('CCSTeam')) {
    const team = entity.getField('m_iTeamNum');

    if (team === TEAM_T) {
      teamT = entity;
    } else if (team === TEAM_CT) {
      teamCT = entity;
    }
  }

  if (teamT === null || teamCT === null) {
    return null;
  }

  return { teamT: readTeam(teamT), teamCT: readTeam(teamCT) };
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

export default function Cs2GameInfo({ demo, fileHeader }) {
  const mapName = fileHeader?.mapName ?? null;
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
