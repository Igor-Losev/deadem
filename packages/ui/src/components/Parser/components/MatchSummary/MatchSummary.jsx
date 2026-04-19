import { Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { useState } from 'react';

import EmptyState from './../EmptyState';

import { compare } from './../../utils';

const TEAM_COLORS = {
  2: { bg: 'rgba(255, 167, 38, 0.08)', border: 'rgba(255, 167, 38, 0.4)', hover: 'rgba(255, 167, 38, 0.15)' },
  3: { bg: 'rgba(66, 165, 245, 0.08)', border: 'rgba(66, 165, 245, 0.4)', hover: 'rgba(66, 165, 245, 0.15)' },
};

const FALLBACK_COLOR = { bg: 'transparent', border: 'rgba(255,255,255,0.1)', hover: 'rgba(255,255,255,0.05)' };

const COLUMNS = [
  { header: 'Player', value: d => d.m_iszPlayerName ?? '', selector: d => d.m_iszPlayerName },
  { header: 'Team', value: d => d.m_iTeamNum ?? 0, selector: d => d.m_iTeamNum, align: 'right' },
  { header: 'Net Worth', value: d => d.m_iGoldNetWorth ?? 0, selector: d => (d.m_iGoldNetWorth ?? 0).toLocaleString(), align: 'right', color: '#ffd54f' },
  { header: 'K', value: d => d.m_iPlayerKills ?? 0, selector: d => d.m_iPlayerKills, align: 'right', color: '#66bb6a' },
  { header: 'D', value: d => d.m_iDeaths ?? 0, selector: d => d.m_iDeaths, align: 'right', color: '#ef5350' },
  { header: 'A', value: d => d.m_iPlayerAssists ?? 0, selector: d => d.m_iPlayerAssists, align: 'right', color: '#90a4ae' },
  { header: 'Damage', value: d => d.m_iHeroDamage ?? 0, selector: d => (d.m_iHeroDamage ?? 0).toLocaleString(), align: 'right', color: '#ff8a65' },
  { header: 'Obj Damage', value: d => d.m_iObjectiveDamage ?? 0, selector: d => (d.m_iObjectiveDamage ?? 0).toLocaleString(), align: 'right', color: '#ffab40' },
  { header: 'Healing', value: d => d.m_iHeroHealing ?? 0, selector: d => (d.m_iHeroHealing ?? 0).toLocaleString(), align: 'right', color: '#4dd0e1' },
];

function getPlayers(demo) {
  const entities = demo?.getEntitiesByClassName('CCitadelPlayerController');

  if (!entities?.length) {
    return [];
  }

  return entities.map(entity => entity.unpackFlattened());
}

export default function MatchSummary({ demo }) {
  const [orderBy, setOrderBy] = useState('Team');
  const [order, setOrder] = useState('asc');

  const players = getPlayers(demo);

  if (!players.length) {
    return <EmptyState icon={<PeopleOutlineIcon color='disabled' />} text='No player data available' />;
  }

  const column = COLUMNS.find(c => c.header === orderBy);

  const sorted = [...players].sort((a, b) => {
    const cmp = compare(column.value(a), column.value(b));

    return order === 'asc' ? cmp : -cmp;
  });

  const handleSort = (header) => {
    if (orderBy === header) {
      setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(header);
      setOrder('asc');
    }
  };

  let prevTeam = null;

  return (
    <Table size='small' stickyHeader>
      <TableHead>
        <TableRow>
          {COLUMNS.map(col => (
            <TableCell key={col.header} align={col.align} sx={{ fontWeight: 'bold' }}>
              <TableSortLabel
                active={orderBy === col.header}
                direction={orderBy === col.header ? order : 'asc'}
                onClick={() => handleSort(col.header)}
              >
                {col.header}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((player, i) => {
          const team = player.m_iTeamNum;
          const color = TEAM_COLORS[team] ?? FALLBACK_COLOR;
          const isNewTeam = team !== prevTeam;
          prevTeam = team;

          return (
            <TableRow
              key={player.m_iszPlayerName || i}
              sx={{
                bgcolor: color.bg,
                borderTop: isNewTeam && i > 0 ? `2px solid ${color.border}` : undefined,
                '&:hover': { bgcolor: color.hover },
              }}
            >
              {COLUMNS.map(col => (
                <TableCell
                  key={col.header}
                  align={col.align}
                  sx={{
                    borderLeft: col.header === 'Player' ? `3px solid ${color.border}` : undefined,
                    color: col.color,
                  }}
                >
                  {col.selector(player)}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
