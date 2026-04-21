import { PeopleOutline as PeopleOutlineIcon } from '@mui/icons-material';
import { Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useState } from 'react';

import EmptyState from './../EmptyState';

import { compare } from './../../utils';

import { DEADLOCK_COLUMNS, getDeadlockPlayerKey, getDeadlockPlayers, getDeadlockTeam } from './helpers/deadlockPlayers';
import { DOTA_COLUMNS, getDotaPlayerKey, getDotaPlayers, getDotaTeam } from './helpers/dotaPlayers';

const TEAM_COLORS = {
  2: { bg: 'rgba(255, 167, 38, 0.08)', border: 'rgba(255, 167, 38, 0.4)', hover: 'rgba(255, 167, 38, 0.15)' },
  3: { bg: 'rgba(66, 165, 245, 0.08)', border: 'rgba(66, 165, 245, 0.4)', hover: 'rgba(66, 165, 245, 0.15)' }
};

const FALLBACK_COLOR = { bg: 'transparent', border: 'rgba(255,255,255,0.1)', hover: 'rgba(255,255,255,0.05)' };

const DOTA_ADAPTER = {
  columns: DOTA_COLUMNS,
  getPlayers: getDotaPlayers,
  getTeam: getDotaTeam,
  getKey: getDotaPlayerKey
};

const DEADLOCK_ADAPTER = {
  columns: DEADLOCK_COLUMNS,
  getPlayers: getDeadlockPlayers,
  getTeam: getDeadlockTeam,
  getKey: getDeadlockPlayerKey
};

function getAdapter(library) {
  return library?.gameCode === 'dota2' ? DOTA_ADAPTER : DEADLOCK_ADAPTER;
}

export default function MatchSummary({ demo, library }) {
  const [orderBy, setOrderBy] = useState('Team');
  const [order, setOrder] = useState('asc');

  const adapter = getAdapter(library);
  const players = adapter.getPlayers(demo);

  if (!players.length) {
    return <EmptyState icon={<PeopleOutlineIcon color='disabled' />} text='No player data available' />;
  }

  const activeColumn = adapter.columns.find((column) => column.header === orderBy) ?? adapter.columns[0];
  const sortedPlayers = [...players].sort((left, right) => {
    const comparison = compare(activeColumn.value(left), activeColumn.value(right));

    return order === 'asc' ? comparison : -comparison;
  });

  const handleSort = (header) => {
    if (orderBy === header) {
      setOrder((previous) => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setOrderBy(header);
    setOrder('asc');
  };

  let previousTeam = null;

  return (
    <Table size='small' stickyHeader>
      <TableHead>
        <TableRow>
          {adapter.columns.map((column) => (
            <TableCell key={column.header} align={column.align} sx={{ fontWeight: 'bold' }}>
              <TableSortLabel
                active={orderBy === column.header}
                direction={orderBy === column.header ? order : 'asc'}
                onClick={() => handleSort(column.header)}
              >
                {column.header}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {sortedPlayers.map((player, index) => {
          const team = adapter.getTeam(player);
          const color = TEAM_COLORS[team] ?? FALLBACK_COLOR;
          const isNewTeam = team !== previousTeam;

          previousTeam = team;

          return (
            <TableRow
              key={adapter.getKey(player, index)}
              sx={{
                bgcolor: color.bg,
                borderTop: isNewTeam && index > 0 ? `2px solid ${color.border}` : undefined,
                '&:hover': { bgcolor: color.hover }
              }}
            >
              {adapter.columns.map((column) => (
                <TableCell
                  key={column.header}
                  align={column.align}
                  sx={{
                    borderLeft: column.header === 'Player' ? `3px solid ${color.border}` : undefined,
                    color: column.color
                  }}
                >
                  {column.selector(player)}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
