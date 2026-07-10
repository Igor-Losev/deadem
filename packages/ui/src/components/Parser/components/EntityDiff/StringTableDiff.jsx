import { InboxOutlined as InboxOutlinedIcon } from '@mui/icons-material';
import { useState } from 'react';

import EmptyState from './../EmptyState';

import EntryDetailModal from './../StringTables/EntryDetailModal';
import { getValuePreview } from './../StringTables/format';

import { formatValue } from './EntityDiff';

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

const SLOT_STYLE = { color: 'rgba(255,255,255,0.3)' };
const KEY_ROW_STYLE = { ...FIELD_STYLE, paddingLeft: 32 };
const TABLE_HEAD_STYLE = { ...HEAD_STYLE, marginBottom: 6 };

const ENTRY_CHIP_STYLE = Object.fromEntries([ 'CLEAR', 'CREATE' ].map((op) => [ op, {
  ...CHIP_STYLE[op],
  alignSelf: 'center',
  fontSize: '0.625rem',
  lineHeight: '16px',
  marginRight: 6,
  minWidth: 0,
  padding: '0 5px'
} ]));

function getEntryOperation(change) {
  if (change.previous === null) {
    return 'CREATE';
  }

  if (change.next.value === null && change.previous.value !== null) {
    return 'CLEAR';
  }

  return 'UPDATE';
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !ArrayBuffer.isView(value);
}

function buildValueRows(change) {
  if (change.previous === null) {
    return null;
  }

  const prev = change.previous.value;
  const next = change.next.value;

  if (!isPlainObject(prev) || !isPlainObject(next)) {
    return null;
  }

  const rows = [];

  for (const key of new Set([ ...Object.keys(prev), ...Object.keys(next) ])) {
    const prevText = formatValue(prev[key]);
    const nextText = formatValue(next[key]);

    if (prevText !== nextText) {
      rows.push({ key, nextText, prevText });
    }
  }

  return rows;
}

function preview(entry) {
  return getValuePreview(entry.value).text;
}

export default function StringTableDiff({ diff }) {
  const [selected, setSelected] = useState(null);

  if (diff.fullSnapshot) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='Full snapshot — too big to diff. See the Tables tab for the full state.' />;
  }

  if (diff.events.length === 0) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='No string table changes at this tick' />;
  }

  return (
    <>
      <div style={LIST_STYLE}>
        {diff.events.map((event, position) => (
          <div key={`${event.tableCode}-${position}`} style={BLOCK_STYLE}>
            <div style={TABLE_HEAD_STYLE}>
              <span style={CHIP_STYLE[event.operation]}>{event.operation}</span>
              <span style={CLASS_STYLE}>{event.tableCode}</span>
              <span style={INDEX_STYLE}>entries={event.entryCount}</span>
            </div>

            {event.entries.map((change) => {
              const rows = buildValueRows(change);
              const operation = getEntryOperation(change);

              return (
                <div
                  key={change.id}
                  onClick={() => setSelected({ entry: change.next, tableCode: event.tableCode })}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={FIELD_STYLE}>
                    {operation !== 'UPDATE' && <span style={ENTRY_CHIP_STYLE[operation]}>{operation}</span>}
                    <span style={NAME_STYLE}>
                      {change.key || '—'}<span style={SLOT_STYLE}> #{change.id}</span>:
                    </span>
                    {rows === null ? (
                      <span style={VALUE_STYLE}>
                        {change.previous === null ? (
                          <span style={NEXT_STYLE}>{preview(change.next)}</span>
                        ) : (
                          <>
                            <span style={PREV_STYLE}>{preview(change.previous)}</span>
                            <span style={ARROW_STYLE}> → </span>
                            <span style={NEXT_STYLE}>{preview(change.next)}</span>
                          </>
                        )}
                      </span>
                    ) : rows.length === 0 && (
                      <span style={SLOT_STYLE}>decoded value unchanged</span>
                    )}
                  </div>

                  {rows !== null && rows.map((row) => (
                    <div key={row.key} style={KEY_ROW_STYLE}>
                      <span style={NAME_STYLE}>{row.key}:</span>
                      <span style={VALUE_STYLE}>
                        <span style={PREV_STYLE}>{row.prevText}</span>
                        <span style={ARROW_STYLE}> → </span>
                        <span style={NEXT_STYLE}>{row.nextText}</span>
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <EntryDetailModal entry={selected.entry} onClose={() => setSelected(null)} tableCode={selected.tableCode} />
      )}
    </>
  );
}
