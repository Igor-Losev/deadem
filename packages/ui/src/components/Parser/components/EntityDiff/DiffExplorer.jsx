import { InboxOutlined as InboxOutlinedIcon } from '@mui/icons-material';
import { ButtonBase } from '@mui/material';
import { useState } from 'react';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from './../../theme';

import EntityDiff from './EntityDiff';
import StringTableDiff from './StringTableDiff';

import {
  HEADER_STYLE,
  HEADER_TITLE_STYLE,
  OPERATION_SUMMARY_STYLE,
  SUMMARY_ITEM_STYLE,
  SUMMARY_LABEL_STYLE,
  SUMMARY_STYLE,
  SUMMARY_VALUE_STYLE,
  TICK_STYLE,
  WRAPPER_STYLE
} from './diffStyles';

const MODES = [
  { key: 'entities', label: 'Entities' },
  { key: 'tables', label: 'String Tables' }
];

const ENTITY_OPERATION_LABELS = [ 'CREATE', 'DELETE', 'LEAVE', 'UPDATE' ];
const TABLE_OPERATION_LABELS = [ 'CREATE', 'UPDATE' ];

const MODE_GROUP_STYLE = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  display: 'inline-flex',
  overflow: 'hidden'
};
const MODE_BUTTON_SX = {
  color: 'rgba(255,255,255,0.55)',
  fontSize: FONT_SIZE.sm,
  fontWeight: 600,
  height: 24,
  px: 1.25,
  transition: 'background-color 0.15s, color 0.15s'
};
const MODE_BUTTON_ACTIVE_SX = {
  ...MODE_BUTTON_SX,
  backgroundColor: 'rgba(179,136,255,0.12)',
  color: COLORS.accent
};

export default function DiffExplorer({ entityDiff, stringTableDiff }) {
  const [mode, setMode] = useState('entities');

  const isEntities = mode === 'entities';
  const diff = isEntities ? entityDiff : stringTableDiff;

  if (entityDiff.tick < 0 && stringTableDiff.tick < 0) {
    return <EmptyState icon={<InboxOutlinedIcon color='disabled' />} text='Step or seek to capture changes for the current tick' />;
  }

  const operationLabels = isEntities ? ENTITY_OPERATION_LABELS : TABLE_OPERATION_LABELS;
  const opCounts = { CREATE: 0, DELETE: 0, LEAVE: 0, UPDATE: 0 };
  let unitCount = 0;

  for (const event of diff.events) {
    opCounts[event.operation] = (opCounts[event.operation] || 0) + 1;
    unitCount += isEntities ? event.fields.length : event.entryCount;
  }

  const tickLabel = diff.prevTick >= 0 ? `${diff.prevTick} → ${diff.tick}` : diff.tick;

  return (
    <div style={WRAPPER_STYLE}>
      <div style={HEADER_STYLE}>
        <div style={HEADER_TITLE_STYLE}>
          {diff.tick >= 0 && <span style={TICK_STYLE}>{tickLabel}</span>}
          <div style={MODE_GROUP_STYLE}>
            {MODES.map((entry) => (
              <ButtonBase
                key={entry.key}
                onClick={() => setMode(entry.key)}
                sx={entry.key === mode ? MODE_BUTTON_ACTIVE_SX : MODE_BUTTON_SX}
              >
                {entry.label}
              </ButtonBase>
            ))}
          </div>
        </div>

        {diff.events.length > 0 && (
          <div style={SUMMARY_STYLE}>
            {operationLabels.filter((op) => opCounts[op] > 0).map((op) => (
              <span key={op} style={OPERATION_SUMMARY_STYLE[op]}>
                <span style={SUMMARY_LABEL_STYLE}>{op}</span>
                <span style={SUMMARY_VALUE_STYLE}>{opCounts[op]}</span>
              </span>
            ))}
            <span style={SUMMARY_ITEM_STYLE}>
              <span style={SUMMARY_LABEL_STYLE}>{isEntities ? 'ENTITIES' : 'TABLES'}</span>
              <span style={SUMMARY_VALUE_STYLE}>{diff.events.length}</span>
            </span>
            <span style={SUMMARY_ITEM_STYLE}>
              <span style={SUMMARY_LABEL_STYLE}>{isEntities ? 'FIELDS' : 'ENTRIES'}</span>
              <span style={SUMMARY_VALUE_STYLE}>{unitCount}</span>
            </span>
          </div>
        )}
      </div>

      {isEntities ? <EntityDiff diff={entityDiff} /> : <StringTableDiff diff={stringTableDiff} />}
    </div>
  );
}
