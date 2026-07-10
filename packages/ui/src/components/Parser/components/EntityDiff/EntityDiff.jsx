import { InboxOutlined as InboxOutlinedIcon } from '@mui/icons-material';

import EmptyState from './../EmptyState';

import { TYPE_BADGE_STYLE } from './../../theme';
import { jsonReplacer } from './../../utils';

import {
  ARROW_STYLE,
  BLOCK_STYLE,
  CHIP_STYLE,
  CLASS_STYLE,
  FIELD_STYLE,
  HEAD_STYLE,
  INDEX_STYLE,
  LIST_STYLE,
  NAME_STYLE,
  NEXT_STYLE,
  PREV_STYLE,
  VALUE_STYLE
} from './diffStyles';

const OPERATION_ORDER = { CREATE: 0, DELETE: 1, LEAVE: 2, UPDATE: 3 };

export function formatValue(value) {
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
  if (diff.fullSnapshot) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='Full snapshot — too big to diff. See the Entities tab for the full state.' />;
  }

  if (diff.events.length === 0) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='No entity changes at this tick' />;
  }

  const events = [ ...diff.events ].sort((a, b) => OPERATION_ORDER[a.operation] - OPERATION_ORDER[b.operation]);

  return (
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
              <span style={NAME_STYLE}>{field.name}<span style={{ ...TYPE_BADGE_STYLE, marginLeft: 3 }}>{field.type}</span>:</span>
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
  );
}
