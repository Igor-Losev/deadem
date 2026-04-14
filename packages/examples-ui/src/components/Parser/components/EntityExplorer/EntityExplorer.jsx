import {
  Category as CategoryIcon,
  ContentCopy as ContentCopyIcon,
  DataObject as DataObjectIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import { Box, Divider, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from './../../theme';
import { HighlightedJson } from './../../utils';

function getEntityId(entity) {
  return `${entity.class.id}-${entity.index}-${entity.serial}`;
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 8px',
  cursor: 'pointer',
  userSelect: 'none',
  fontSize: FONT_SIZE.lg,
  lineHeight: '24px',
};

function ChevronIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{
        flexShrink: 0,
        transition: 'transform 0.15s',
        transform: open ? 'rotate(90deg)' : 'none',
      }}
    >
      <path
        d="M6 3.5L10.5 8 6 12.5"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EntityTree({ entityClasses, entityContainers, onEntityClick, selectedEntityId }) {
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (classId) => {
    setExpanded(prev => {
      const next = new Set(prev);
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
              style={rowStyle}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => toggleExpand(classId)}
            >
              <ChevronIcon open={isExpanded} />
              <span style={{ color: COLORS.entityClass, fontWeight: 600 }}>{entityClass.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: FONT_SIZE.sm }}>id {classId}</span>
              <span style={{
                backgroundColor: `${COLORS.entityClass}22`,
                color: COLORS.entityClass,
                fontSize: FONT_SIZE.xs,
                fontWeight: 600,
                padding: '0 5px',
                borderRadius: 8,
                lineHeight: '18px',
              }}>
                {entities.length}
              </span>
            </div>

            {isExpanded && (
              <div style={{ marginLeft: 15, borderLeft: '1px dashed rgba(255,255,255,0.12)' }}>
                {entities.map((entity, entityIndex) => {
                  const entityId = getEntityId(entity);
                  const isSelected = entityId === selectedEntityId;

                  return (
                    <div
                      key={entityId}
                      style={{
                        ...rowStyle,
                        paddingLeft: 16,
                        backgroundColor: isSelected ? 'rgba(124,77,255,0.12)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      onClick={() => onEntityClick(entityId)}
                    >
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: entity.active ? '#69f0ae' : 'rgba(255,255,255,0.15)',
                        flexShrink: 0,
                      }} />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZE.md }}>#{entityIndex + 1}</span>
                      <span style={{ fontSize: FONT_SIZE.md }}>
                        index=<span style={{ color: '#69f0ae' }}>{entity.index}</span>
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: FONT_SIZE.md }}>
                        serial=<span style={{ color: 'rgba(255,255,255,0.55)' }}>{entity.serial}</span>
                      </span>
                    </div>
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

export default function EntityExplorer({ demo, contentVersion }) {
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const entities = demo ? demo.getEntities() : [];

  const entityContainers = entities.reduce((containers, entity) => {
    const entityClass = entity.class;
    const entityId = getEntityId(entity);

    const entitiesByClass = containers.byClass.get(entityClass) || null;

    if (entitiesByClass === null) {
      containers.byClass.set(entityClass, [entity]);
    } else {
      entitiesByClass.push(entity);
    }

    containers.byId.set(entityId, entity);

    return containers;
  }, { byClass: new Map(), byId: new Map() });

  const selectedEntity = selectedEntityId !== null
    ? entityContainers.byId.get(selectedEntityId) ?? null
    : null;

  const unpackedEntity = useMemo(() => {
    if (selectedEntity === null) {
      return null;
    }

    return JSON.stringify(
      selectedEntity.unpackFlattened(),
      (key, value) => typeof value === 'bigint' ? value.toString() + 'n' : value,
      2
    );
  }, [selectedEntity, contentVersion]);

  const handleEntityClick = (entityId) => {
    if (!entityContainers.byId.has(entityId)) return;
    setSelectedEntityId(entityId);
    setCopied(false);
  };

  const handleCopyClicked = useCallback(() => {
    if (!unpackedEntity) return;

    navigator.clipboard.writeText(unpackedEntity).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [unpackedEntity]);

  const entityClasses = Array.from(entityContainers.byClass.keys());

  entityClasses.sort((a, b) => a.name.localeCompare(b.name));

  const filterLower = filter.toLowerCase();
  const filteredClasses = filterLower
    ? entityClasses.filter(c => c.name.toLowerCase().includes(filterLower))
    : entityClasses;

  const hasEntities = entityClasses.length > 0;

  return (
    <Box color='text.primary' display='flex' minHeight={0}>
      {hasEntities ? (
        <>
          <Box flex={1} display='flex' flexDirection='column' overflow='hidden'>
            <Box px={1} display='flex' alignItems='center' sx={{ height: 44 }}>
              <TextField
                size='small'
                placeholder='Filter classes...'
                value={filter}
                onChange={e => setFilter(e.target.value)}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <CategoryIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: FONT_SIZE.md, height: 32 },
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&.Mui-focused fieldset': { borderColor: COLORS.jsonBoolean },
                  },
                }}
              />
            </Box>
            <Divider />
            <Box flex={1} overflow='auto'>
              {filteredClasses.length > 0 ? (
                <EntityTree
                  entityClasses={filteredClasses}
                  entityContainers={entityContainers}
                  onEntityClick={handleEntityClick}
                  selectedEntityId={selectedEntityId}
                />
              ) : (
                <EmptyState
                  icon={<SearchOffIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
                  text='No classes match your filter'
                />
              )}
            </Box>
          </Box>

          <Divider orientation='vertical' flexItem />

          <Box display='flex' flexDirection='column' flex={1} minWidth={0}>
            {unpackedEntity ? (
              <>
                <Box display='flex' alignItems='center' justifyContent='space-between' px={1} sx={{ height: 44 }}>
                  <Typography fontSize={FONT_SIZE.sm} color='text.secondary' noWrap>
                    {selectedEntity.class.name}
                    <Typography component='span' fontSize={FONT_SIZE.sm} color='text.disabled'>
                      {' '}/ index={selectedEntity.index}
                    </Typography>
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy JSON'} arrow>
                    <IconButton onClick={handleCopyClicked} size='small'>
                      <ContentCopyIcon sx={{ fontSize: FONT_SIZE.lg }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Divider />

                <Box flex={1} overflow='auto' px={1.5} py={1}>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: FONT_SIZE.sm,
                      lineHeight: 1.65,
                      fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <HighlightedJson json={unpackedEntity} />
                  </pre>
                </Box>
              </>
            ) : (
              <EmptyState
                icon={<DataObjectIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
                text='Select an entity to view properties'
              />
            )}
          </Box>
        </>
      ) : (
        <EmptyState
          icon={<CategoryIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
          text='No entities available'
        />
      )}
    </Box>
  );
}
