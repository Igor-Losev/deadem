import { useState } from 'react';

import { COLORS, FONT_SIZE } from './../../theme';

import { getEntityId } from './entities';

const ROW_STYLE = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  fontSize: FONT_SIZE.lg,
  gap: 6,
  lineHeight: '24px',
  padding: '3px 8px',
  userSelect: 'none'
};

function ChevronIcon({ open }) {
  return (
    <svg
      height='16'
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(90deg)' : 'none',
        transition: 'transform 0.15s'
      }}
      viewBox='0 0 16 16'
      width='16'
    >
      <path
        d='M6 3.5L10.5 8 6 12.5'
        fill='none'
        stroke='rgba(255,255,255,0.4)'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  );
}

function EntityRow({ entity, index, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={(event) => {
        if (!isSelected) {
          event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={(event) => {
        if (!isSelected) {
          event.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      style={{
        ...ROW_STYLE,
        backgroundColor: isSelected ? 'rgba(124,77,255,0.12)' : 'transparent',
        paddingLeft: 16
      }}
    >
      <span
        style={{
          backgroundColor: entity.active ? '#69f0ae' : 'rgba(255,255,255,0.15)',
          borderRadius: '50%',
          flexShrink: 0,
          height: 7,
          width: 7
        }}
      />
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZE.md }}>#{index + 1}</span>
      <span style={{ fontSize: FONT_SIZE.md }}>
        index=<span style={{ color: '#69f0ae' }}>{entity.index}</span>
      </span>
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: FONT_SIZE.md }}>
        serial=<span style={{ color: 'rgba(255,255,255,0.55)' }}>{entity.serial}</span>
      </span>
    </div>
  );
}

export default function EntityTree({ entityClasses, entityContainers, onEntityClick, selectedEntityId }) {
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (classId) => {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (next.has(classId)) {
        next.delete(classId);
      } else {
        next.add(classId);
      }

      return next;
    });
  };

  return (
    <div style={{ padding: '4px 0' }}>
      {entityClasses.map((entityClass) => {
        const entities = entityContainers.byClass.get(entityClass);
        const classId = entityClass.id;
        const isExpanded = expanded.has(classId);

        return (
          <div key={classId}>
            <div
              onClick={() => toggleExpand(classId)}
              onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}
              style={ROW_STYLE}
            >
              <ChevronIcon open={isExpanded} />
              <span style={{ color: COLORS.entityClass, fontWeight: 600 }}>{entityClass.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: FONT_SIZE.sm }}>id {classId}</span>
              <span
                style={{
                  backgroundColor: `${COLORS.entityClass}22`,
                  borderRadius: 8,
                  color: COLORS.entityClass,
                  fontSize: FONT_SIZE.xs,
                  fontWeight: 600,
                  lineHeight: '18px',
                  padding: '0 5px'
                }}
              >
                {entities.length}
              </span>
            </div>

            {isExpanded && (
              <div style={{ borderLeft: '1px dashed rgba(255,255,255,0.12)', marginLeft: 15 }}>
                {entities.map((entity, entityIndex) => {
                  const entityId = getEntityId(entity);

                  return (
                    <EntityRow
                      key={entityId}
                      entity={entity}
                      index={entityIndex}
                      isSelected={entityId === selectedEntityId}
                      onClick={() => onEntityClick(entityId)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
