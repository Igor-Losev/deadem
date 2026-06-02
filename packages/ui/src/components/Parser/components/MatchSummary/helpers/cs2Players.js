const TEAM_T = 2;
const TEAM_CT = 3;

const TEAM_LABELS = {
  [TEAM_T]: 'T',
  [TEAM_CT]: 'CT'
};

const STAT = (key) => (player) => player[`m_pActionTrackingServices.${key}`] ?? 0;

const PLAYER_FIELDS = [
  'm_iMVPs',
  'm_iTeamNum',
  'm_iszPlayerName',
  'm_pActionTrackingServices.m_iAssists',
  'm_pActionTrackingServices.m_iDamage',
  'm_pActionTrackingServices.m_iDeaths',
  'm_pActionTrackingServices.m_iHeadShotKills',
  'm_pActionTrackingServices.m_iKills',
  'm_pActionTrackingServices.m_iUtilityDamage'
];

export const CS2_COLUMNS = [
  { header: 'Player', value: (player) => player.m_iszPlayerName ?? '', selector: (player) => player.m_iszPlayerName },
  { header: 'Team', value: (player) => player.m_iTeamNum ?? 0, selector: (player) => TEAM_LABELS[player.m_iTeamNum] ?? '-', align: 'right' },
  { header: 'Weapon', value: (player) => player.weapon ?? '', selector: (player) => player.weapon ?? '—', align: 'right', width: '110px' },
  { header: 'K', value: STAT('m_iKills'), selector: STAT('m_iKills'), align: 'right', color: '#66bb6a' },
  { header: 'D', value: STAT('m_iDeaths'), selector: STAT('m_iDeaths'), align: 'right', color: '#ef5350' },
  { header: 'A', value: STAT('m_iAssists'), selector: STAT('m_iAssists'), align: 'right', color: '#90a4ae' },
  { header: 'HS', value: STAT('m_iHeadShotKills'), selector: STAT('m_iHeadShotKills'), align: 'right', color: '#ffd54f' },
  { header: 'Damage', value: STAT('m_iDamage'), selector: (player) => STAT('m_iDamage')(player).toLocaleString(), align: 'right', color: '#ff8a65' },
  { header: 'Utility Dmg', value: STAT('m_iUtilityDamage'), selector: (player) => STAT('m_iUtilityDamage')(player).toLocaleString(), align: 'right', color: '#ffab40' },
  { header: 'MVPs', value: (player) => player.m_iMVPs ?? 0, selector: (player) => player.m_iMVPs ?? 0, align: 'right', color: '#ce93d8' }
];

function resolveActiveWeapon(demo, controller) {
  const pawnHandle = controller.getField('m_hPlayerPawn');

  if (!Number.isInteger(pawnHandle)) {
    return null;
  }

  const pawn = demo.getEntityByHandle(pawnHandle);

  if (pawn === null) {
    return null;
  }

  const weaponHandle = pawn.getField('m_pWeaponServices.m_hActiveWeapon');

  if (!Number.isInteger(weaponHandle)) {
    return null;
  }

  const weapon = demo.getEntityByHandle(weaponHandle);

  if (weapon === null) {
    return null;
  }

  return weapon.class.name.replace(/^CWeapon/, '').replace(/^C/, '');
}

function readPlayer(demo, entity) {
  const player = { weapon: resolveActiveWeapon(demo, entity) };

  for (const field of PLAYER_FIELDS) {
    player[field] = entity.getField(field);
  }

  return player;
}

export function getCs2Players(demo) {
  if (!demo) {
    return [];
  }

  const players = [];

  for (const entity of demo.getEntitiesByClassNameIterator('CCSPlayerController')) {
    const name = entity.getField('m_iszPlayerName');
    const team = entity.getField('m_iTeamNum');

    if (!name || (team !== TEAM_T && team !== TEAM_CT)) {
      continue;
    }

    players.push(readPlayer(demo, entity));
  }

  return players;
}

export function getCs2Team(player) {
  return player?.m_iTeamNum ?? null;
}

export function getCs2PlayerKey(player, fallback) {
  return player.m_iszPlayerName || fallback;
}
