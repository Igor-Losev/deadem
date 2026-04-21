export const DEADLOCK_COLUMNS = [
  { header: 'Player', value: (player) => player.m_iszPlayerName ?? '', selector: (player) => player.m_iszPlayerName },
  { header: 'Team', value: (player) => player.m_iTeamNum ?? 0, selector: (player) => player.m_iTeamNum, align: 'right' },
  { header: 'Net Worth', value: (player) => player.m_iGoldNetWorth ?? 0, selector: (player) => (player.m_iGoldNetWorth ?? 0).toLocaleString(), align: 'right', color: '#ffd54f' },
  { header: 'K', value: (player) => player.m_iPlayerKills ?? 0, selector: (player) => player.m_iPlayerKills, align: 'right', color: '#66bb6a' },
  { header: 'D', value: (player) => player.m_iDeaths ?? 0, selector: (player) => player.m_iDeaths, align: 'right', color: '#ef5350' },
  { header: 'A', value: (player) => player.m_iPlayerAssists ?? 0, selector: (player) => player.m_iPlayerAssists, align: 'right', color: '#90a4ae' },
  { header: 'Damage', value: (player) => player.m_iHeroDamage ?? 0, selector: (player) => (player.m_iHeroDamage ?? 0).toLocaleString(), align: 'right', color: '#ff8a65' },
  { header: 'Obj Damage', value: (player) => player.m_iObjectiveDamage ?? 0, selector: (player) => (player.m_iObjectiveDamage ?? 0).toLocaleString(), align: 'right', color: '#ffab40' },
  { header: 'Healing', value: (player) => player.m_iHeroHealing ?? 0, selector: (player) => (player.m_iHeroHealing ?? 0).toLocaleString(), align: 'right', color: '#4dd0e1' }
];

export function getDeadlockPlayers(demo) {
  const entities = demo?.getEntitiesByClassName('CCitadelPlayerController');

  if (!entities?.length) {
    return [];
  }

  return entities.map((entity) => entity.unpackFlattened());
}

export function getDeadlockTeam(player) {
  return player?.m_iTeamNum ?? null;
}

export function getDeadlockPlayerKey(player, fallback) {
  return player.m_iszPlayerName || fallback;
}
