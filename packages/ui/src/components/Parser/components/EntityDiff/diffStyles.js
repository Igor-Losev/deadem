import { COLORS, FONT_MONO, FONT_SIZE } from './../../theme';

const OPERATION_COLOR = {
  CREATE: '#69f0ae',
  UPDATE: '#b388ff',
  DELETE: '#ff5252',
  CLEAR: '#ff5252',
  LEAVE: '#ffb74d'
};

export const CHIP_STYLE = Object.fromEntries(Object.entries(OPERATION_COLOR).map(([ op, color ]) => [ op, {
  backgroundColor: `${color}16`,
  border: `1px solid ${color}35`,
  borderRadius: 6,
  color,
  flexShrink: 0,
  fontSize: FONT_SIZE.xs,
  fontWeight: 700,
  lineHeight: '20px',
  minWidth: 52,
  padding: '0 7px',
  textAlign: 'center'
} ]));

export const OPERATION_SUMMARY_STYLE = Object.fromEntries(Object.entries(OPERATION_COLOR).map(([ op, color ]) => [ op, {
  backgroundColor: `${color}12`,
  border: `1px solid ${color}32`,
  borderRadius: 6,
  color,
  display: 'inline-flex',
  gap: 6,
  lineHeight: '22px',
  padding: '0 8px',
  whiteSpace: 'nowrap'
} ]));

export const WRAPPER_STYLE = { display: 'flex', flexDirection: 'column', minHeight: 0 };
export const HEADER_STYLE = {
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.025)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  justifyContent: 'space-between',
  minHeight: 48,
  padding: '8px 12px'
};
export const HEADER_TITLE_STYLE = { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8, minWidth: 0 };
export const TICK_STYLE = {
  backgroundColor: 'rgba(179,136,255,0.12)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  color: COLORS.accent,
  fontFamily: FONT_MONO,
  fontSize: FONT_SIZE.sm,
  fontWeight: 700,
  lineHeight: '24px',
  padding: '0 9px',
  whiteSpace: 'nowrap'
};
export const SUMMARY_STYLE = { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' };
export const SUMMARY_ITEM_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.045)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  color: 'rgba(255,255,255,0.86)',
  display: 'inline-flex',
  gap: 6,
  lineHeight: '22px',
  padding: '0 8px',
  whiteSpace: 'nowrap'
};
export const SUMMARY_LABEL_STYLE = { color: 'rgba(255,255,255,0.46)', fontSize: FONT_SIZE.xs, fontWeight: 700 };
export const SUMMARY_VALUE_STYLE = { fontFamily: FONT_MONO, fontSize: FONT_SIZE.sm, fontWeight: 700 };
export const LIST_STYLE = { flex: 1, minHeight: 0, overflow: 'auto', padding: '8px 12px' };
export const BLOCK_STYLE = { marginBottom: 10 };
export const HEAD_STYLE = { alignItems: 'center', display: 'flex', gap: 8, marginBottom: 2 };
export const CLASS_STYLE = { color: COLORS.entityClass, fontSize: FONT_SIZE.sm };
export const INDEX_STYLE = { color: 'rgba(255,255,255,0.4)', fontSize: FONT_SIZE.sm };
export const FIELD_STYLE = { display: 'flex', fontFamily: FONT_MONO, fontSize: FONT_SIZE.sm, lineHeight: 1.6, paddingLeft: 16, whiteSpace: 'nowrap' };
export const NAME_STYLE = { color: 'rgba(255,255,255,0.6)', flexShrink: 0, paddingRight: 6 };
export const VALUE_STYLE = { color: 'rgba(255,255,255,0.85)' };
export const PREV_STYLE = { color: 'rgba(255,255,255,0.4)' };
export const ARROW_STYLE = { color: 'rgba(255,255,255,0.3)' };
export const NEXT_STYLE = { color: COLORS.jsonNumber };
