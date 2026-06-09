const RADIANT_TEAM = 2;
const DIRE_TEAM = 3;
const TEAM_SIZE = 5;

export const DOTA_COLUMNS = [
  { header: 'Player', value: (player) => player.playerName ?? '', selector: (player) => player.playerName },
  { header: 'Team', value: (player) => player.team ?? 0, selector: (player) => player.team, align: 'right' },
  { header: 'Hero', value: (player) => player.heroId ?? 0, selector: (player) => player.heroId ?? '-', align: 'right', color: '#ffd54f' },
  { header: 'Lvl', value: (player) => player.level ?? 0, selector: (player) => player.level ?? '-', align: 'right', color: '#90caf9' },
  { header: 'K', value: (player) => player.kills ?? 0, selector: (player) => player.kills, align: 'right', color: '#66bb6a' },
  { header: 'D', value: (player) => player.deaths ?? 0, selector: (player) => player.deaths, align: 'right', color: '#ef5350' },
  { header: 'A', value: (player) => player.assists ?? 0, selector: (player) => player.assists, align: 'right', color: '#90a4ae' },
  { header: 'Teamfight', value: (player) => player.teamfightParticipation ?? 0, selector: (player) => `${Math.round((player.teamfightParticipation ?? 0) * 100)}%`, align: 'right', color: '#ff8a65' },
  { header: 'Bounty', value: (player) => player.bountyRunes ?? 0, selector: (player) => player.bountyRunes, align: 'right', color: '#ffcc80' },
  { header: 'Power', value: (player) => player.powerRunes ?? 0, selector: (player) => player.powerRunes, align: 'right', color: '#ce93d8' },
  { header: 'Water', value: (player) => player.waterRunes ?? 0, selector: (player) => player.waterRunes, align: 'right', color: '#4dd0e1' }
];

function findScoreboardEntity(demo) {
  if (!demo) {
    return null;
  }

  for (const entity of demo.getEntitiesByClassNameIterator('CDOTA_PlayerResource')) {
    if (entity.hasField('m_vecPlayerTeamData') && entity.hasField('m_vecPlayerData')) {
      return entity;
    }
  }

  return null;
}

function readArrayField(entity, field, index) {
  const prefix = `${field}.${index.toString().padStart(4, '0')}.`;

  return (key, fallback) => entity.getField(`${prefix}${key}`) ?? fallback;
}

function readTeamRows(entity) {
  const length = entity.getField('m_vecPlayerTeamData') ?? 0;
  const rows = [];

  for (let index = 0; index < length; index += 1) {
    const read = readArrayField(entity, 'm_vecPlayerTeamData', index);
    const team = index < TEAM_SIZE ? RADIANT_TEAM : DIRE_TEAM;

    rows.push({
      assists: read('m_iAssists', 0),
      bountyRunes: read('m_iBountyRunes', 0),
      deaths: read('m_iDeaths', 0),
      heroId: read('m_nSelectedHeroID', null),
      index,
      kills: read('m_iKills', 0),
      level: read('m_iLevel', 0),
      playerName: `Player ${index + 1}`,
      powerRunes: read('m_iPowerRunes', 0),
      team,
      teamSlot: read('m_iTeamSlot', index % TEAM_SIZE),
      teamfightParticipation: read('m_flTeamFightParticipation', 0),
      waterRunes: read('m_iWaterRunes', 0)
    });
  }

  return rows;
}

function readPlayerRows(entity) {
  const length = entity.getField('m_vecPlayerData') ?? 0;
  const rows = [];

  for (let index = 0; index < length; index += 1) {
    const read = readArrayField(entity, 'm_vecPlayerData', index);
    const isValid = read('m_bIsValid', false) === true;
    const isBroadcaster = read('m_bIsBroadcaster', false) === true;
    const team = read('m_iPlayerTeam', null);

    if (!isValid || isBroadcaster || (team !== RADIANT_TEAM && team !== DIRE_TEAM)) {
      continue;
    }

    rows.push({
      playerName: read('m_iszPlayerName', `Player ${index + 1}`),
      team
    });
  }

  return rows;
}

export function getDotaPlayers(demo) {
  const entity = findScoreboardEntity(demo);

  if (entity === null) {
    return [];
  }

  const teamRows = readTeamRows(entity);
  const playerRows = readPlayerRows(entity);

  const playerQueues = new Map();

  for (const row of playerRows) {
    const queue = playerQueues.get(row.team) ?? [];

    queue.push(row);
    playerQueues.set(row.team, queue);
  }

  return teamRows.map((row) => {
    const queue = playerQueues.get(row.team) ?? [];
    const player = queue.shift();

    return {
      ...row,
      playerName: player?.playerName ?? row.playerName
    };
  });
}

export function getDotaTeam(player) {
  return player?.team ?? null;
}

export function getDotaPlayerKey(player, fallback) {
  return player.playerName || fallback;
}
