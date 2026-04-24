import {
  Category as CategoryIcon,
  ContentCopy as ContentCopyIcon,
  DataObject as DataObjectIcon,
  SearchOff as SearchOffIcon
} from '@mui/icons-material';
import { Box, Divider, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from './../../theme';
import { HighlightedJson } from './../../utils';

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

function getEntityId(entity) {
  return `${entity.class.id}-${entity.index}-${entity.serial}`;
}

function groupEntities(entities) {
  const containers = { byClass: new Map(), byId: new Map() };

  for (const entity of entities) {
    const entityClass = entity.class;
    const entityId = getEntityId(entity);
    const existing = containers.byClass.get(entityClass);

    if (existing) {
      existing.push(entity);
    } else {
      containers.byClass.set(entityClass, [entity]);
    }

    containers.byId.set(entityId, entity);
  }

  return containers;
}

function stringifyEntity(entity) {
  return JSON.stringify(
    entity.unpackFlattened(),
    (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value,
    2
  );
}

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

function EntityTree({ entityClasses, entityContainers, onEntityClick, selectedEntityId }) {
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

function EntityDetails({ entity, json, copied, onCopy }) {
  return (
    <>
      <Box alignItems='center' display='flex' justifyContent='space-between' px={1} sx={{ height: 44 }}>
        <Typography color='text.secondary' fontSize={FONT_SIZE.sm} noWrap>
          {entity.class.name}
          <Typography component='span' color='text.disabled' fontSize={FONT_SIZE.sm}>
            {' '}/ index={entity.index}
          </Typography>
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy JSON'} arrow>
          <IconButton onClick={onCopy} size='small'>
            <ContentCopyIcon sx={{ fontSize: FONT_SIZE.lg }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      <Box flex={1} overflow='auto' px={1.5} py={1}>
        <pre
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
            fontSize: FONT_SIZE.sm,
            lineHeight: 1.65,
            margin: 0
          }}
        >
          <HighlightedJson json={json} />
        </pre>
      </Box>
    </>
  );
}

export default function EntityExplorer({ demo, contentVersion }) {
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const entities = demo ? demo.getEntities() : [];
  const entityContainers = useMemo(() => groupEntities(entities), [entities]);

  const selectedEntity = selectedEntityId !== null
    ? entityContainers.byId.get(selectedEntityId) ?? null
    : null;

  const unpackedEntity = useMemo(
    () => selectedEntity === null ? null : stringifyEntity(selectedEntity),
    [selectedEntity, contentVersion]
  );

  const handleEntityClick = (entityId) => {
    if (!entityContainers.byId.has(entityId)) {
      return;
    }

    setSelectedEntityId(entityId);
    setCopied(false);
  };

  const handleCopyClicked = useCallback(() => {
    if (!unpackedEntity) {
      return;
    }

    navigator.clipboard.writeText(unpackedEntity).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [unpackedEntity]);

  const entityClasses = useMemo(() => {
    const classes = Array.from(entityContainers.byClass.keys());

    classes.sort((left, right) => left.name.localeCompare(right.name));

    return classes;
  }, [entityContainers]);

  const filteredClasses = useMemo(() => {
    const trimmed = filter.trim().toLowerCase();

    if (!trimmed) {
      return entityClasses;
    }

    return entityClasses.filter((entityClass) => entityClass.name.toLowerCase().includes(trimmed));
  }, [entityClasses, filter]);

  const hasEntities = entityClasses.length > 0;

  if (!hasEntities) {
    return (
      <Box color='text.primary' display='flex' minHeight={0}>
        <EmptyState
          icon={<CategoryIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
          text='No entities available'
        />
      </Box>
    );
  }

  return (
    <Box color='text.primary' display='flex' minHeight={0}>
      <Box display='flex' flex={1} flexDirection='column' overflow='hidden'>
        <Box alignItems='center' display='flex' px={1} sx={{ height: 44 }}>
          <TextField
            fullWidth
            onChange={(event) => setFilter(event.target.value)}
            placeholder='Filter classes...'
            size='small'
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <CategoryIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: FONT_SIZE.md, height: 32 }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                '&.Mui-focused fieldset': { borderColor: COLORS.jsonBoolean }
              }
            }}
            value={filter}
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

      <Box display='flex' flex={1} flexDirection='column' minWidth={0}>
        {unpackedEntity ? (
          <EntityDetails
            entity={selectedEntity}
            json={unpackedEntity}
            copied={copied}
            onCopy={handleCopyClicked}
          />
        ) : (
          <EmptyState
            icon={<DataObjectIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
            text='Select an entity to view properties'
          />
        )}
      </Box>
    </Box>
  );
}
