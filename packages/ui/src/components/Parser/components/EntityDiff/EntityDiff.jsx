import { InboxOutlined as InboxOutlinedIcon } from '@mui/icons-material';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from './../../theme';
import { jsonReplacer } from './../../utils';

const MONO_FONT = "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace";

const OPERATION_COLOR = {
  CREATE: '#69f0ae',
  UPDATE: '#b388ff',
  DELETE: '#ff5252',
  LEAVE: '#ffb74d'
};
const OPERATION_LABELS = [ 'CREATE', 'DELETE', 'LEAVE', 'UPDATE' ];

const OPERATION_ORDER = { CREATE: 0, DELETE: 1, LEAVE: 2, UPDATE: 3 };

const CHIP_STYLE = Object.fromEntries(Object.entries(OPERATION_COLOR).map(([ op, color ]) => [ op, {
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
const OPERATION_SUMMARY_STYLE = Object.fromEntries(Object.entries(OPERATION_COLOR).map(([ op, color ]) => [ op, {
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

const WRAPPER_STYLE = { display: 'flex', flexDirection: 'column', minHeight: 0 };
const HEADER_STYLE = {
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
const HEADER_TITLE_STYLE = { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8, minWidth: 0 };
const TICK_STYLE = {
  backgroundColor: 'rgba(179,136,255,0.12)',
  border: '1px solid rgba(179,136,255,0.28)',
  borderRadius: 6,
  color: COLORS.accent,
  fontFamily: MONO_FONT,
  fontSize: FONT_SIZE.sm,
  fontWeight: 700,
  lineHeight: '24px',
  padding: '0 9px',
  whiteSpace: 'nowrap'
};
const SUMMARY_STYLE = { alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' };
const SUMMARY_ITEM_STYLE = {
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
const SUMMARY_LABEL_STYLE = { color: 'rgba(255,255,255,0.46)', fontSize: FONT_SIZE.xs, fontWeight: 700 };
const SUMMARY_VALUE_STYLE = { fontFamily: MONO_FONT, fontSize: FONT_SIZE.sm, fontWeight: 700 };
const LIST_STYLE = { flex: 1, minHeight: 0, overflow: 'auto', padding: '8px 12px' };
const BLOCK_STYLE = { marginBottom: 10 };
const HEAD_STYLE = { alignItems: 'center', display: 'flex', gap: 8, marginBottom: 2 };
const CLASS_STYLE = { color: COLORS.entityClass, fontSize: FONT_SIZE.sm };
const INDEX_STYLE = { color: 'rgba(255,255,255,0.4)', fontSize: FONT_SIZE.sm };
const FIELD_STYLE = { display: 'flex', fontFamily: MONO_FONT, fontSize: FONT_SIZE.sm, lineHeight: 1.6, paddingLeft: 16, whiteSpace: 'nowrap' };
const NAME_STYLE = { color: 'rgba(255,255,255,0.6)', flexShrink: 0, paddingRight: 8 };
const TYPE_STYLE = { color: 'rgba(255,255,255,0.3)' };
const VALUE_STYLE = { color: 'rgba(255,255,255,0.85)' };
const PREV_STYLE = { color: 'rgba(255,255,255,0.4)' };
const ARROW_STYLE = { color: 'rgba(255,255,255,0.3)' };
const NEXT_STYLE = { color: COLORS.jsonNumber };

function formatValue(value) {
  if (value === undefined) {
    return '∅';
  }

  if (typeof value === 'bigint') {
    return `${value}n`;
  }

  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    const items = Array.isArray(value) ? value : Array.from(value);

    return `[${items.map(formatValue).join(', ')}]`;
  }

  if (value !== null && typeof value === 'object') {
    return JSON.stringify(value, jsonReplacer);
  }

  return String(value);
}

export default function EntityDiff({ diff }) {
  if (diff === null || diff.tick < 0) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='Step or seek to capture entity changes for the current tick' />;
  }

  if (diff.fullSnapshot) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='Full snapshot — too big to diff. See the Entities tab for the full state.' />;
  }

  if (diff.events.length === 0) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='No entity changes at this tick' />;
  }

  let fieldCount = 0;
  const opCounts = { CREATE: 0, DELETE: 0, LEAVE: 0, UPDATE: 0 };

  for (const event of diff.events) {
    fieldCount += event.fields.length;
    opCounts[event.operation] = (opCounts[event.operation] || 0) + 1;
  }

  const events = [ ...diff.events ].sort((a, b) => OPERATION_ORDER[a.operation] - OPERATION_ORDER[b.operation]);

  const tickLabel = diff.prevTick >= 0 ? `${diff.prevTick} → ${diff.tick}` : diff.tick;

  return (
    <div style={WRAPPER_STYLE}>
      <div style={HEADER_STYLE}>
        <div style={HEADER_TITLE_STYLE}>
          <span style={TICK_STYLE}>{tickLabel}</span>
        </div>

        <div style={SUMMARY_STYLE}>
          {OPERATION_LABELS.filter((op) => opCounts[op] > 0).map((op) => (
            <span key={op} style={OPERATION_SUMMARY_STYLE[op]}>
              <span style={SUMMARY_LABEL_STYLE}>{op}</span>
              <span style={SUMMARY_VALUE_STYLE}>{opCounts[op]}</span>
            </span>
          ))}
          <span style={SUMMARY_ITEM_STYLE}>
            <span style={SUMMARY_LABEL_STYLE}>ENTITIES</span>
            <span style={SUMMARY_VALUE_STYLE}>{diff.events.length}</span>
          </span>
          <span style={SUMMARY_ITEM_STYLE}>
            <span style={SUMMARY_LABEL_STYLE}>FIELDS</span>
            <span style={SUMMARY_VALUE_STYLE}>{fieldCount}</span>
          </span>
        </div>
      </div>

      <div style={LIST_STYLE}>
        {events.map((event, position) => (
          <div key={`${event.index}-${event.serial}-${position}`} style={BLOCK_STYLE}>
            <div style={HEAD_STYLE}>
              <span style={CHIP_STYLE[event.operation] || CHIP_STYLE.UPDATE}>{event.operation}</span>
              <span style={CLASS_STYLE}>{event.className}</span>
              <span style={INDEX_STYLE}>index={event.index}</span>
            </div>

            {event.fields.map((field) => (
              <div key={field.name} style={FIELD_STYLE}>
                <span style={NAME_STYLE}>{field.name}<span style={TYPE_STYLE}> ({field.type})</span>:</span>
                <span style={VALUE_STYLE}>
                  {field.previous === undefined ? (
                    <span style={NEXT_STYLE}>{formatValue(field.next)}</span>
                  ) : (
                    <>
                      <span style={PREV_STYLE}>{formatValue(field.previous)}</span>
                      <span style={ARROW_STYLE}> → </span>
                      <span style={NEXT_STYLE}>{formatValue(field.next)}</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
