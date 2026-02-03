import {
  Category as CategoryIcon,
  ContentCopy as ContentCopyIcon,
  DataObject as DataObjectIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import { Box, Divider, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

const CLASS_COLOR = '#b388ff';

function getEntityId(entity) {
  return `${entity.class.id}-${entity.index}-${entity.serial}`;
}

function highlightJson(json) {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*(:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?\b)/g,
    (match, str, colon, bool, num) => {
      if (str && colon) {
        return `<span style="color:#b388ff">${str}</span>:`;
      }
      if (str) {
        return `<span style="color:#80cbc4">${str}</span>`;
      }
      if (bool) {
        return `<span style="color:#7c4dff">${bool}</span>`;
      }
      if (num) {
        return `<span style="color:#69f0ae">${num}</span>`;
      }
      return match;
    }
  );
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 8px',
  cursor: 'pointer',
  userSelect: 'none',
  fontSize: '0.875rem',
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
              <span style={{ color: CLASS_COLOR, fontWeight: 600 }}>{entityClass.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>id {classId}</span>
              <span style={{
                backgroundColor: `${CLASS_COLOR}22`,
                color: CLASS_COLOR,
                fontSize: '0.6875rem',
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
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>#{entityIndex + 1}</span>
                      <span style={{ fontSize: '0.8125rem' }}>
                        index=<span style={{ color: '#69f0ae' }}>{entity.index}</span>
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem' }}>
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

function EmptyState({ icon, text }) {
  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' gap={1} flex={1} minHeight={140} width='100%'>
      {icon}
      <Typography color='text.disabled' fontSize='0.8125rem'>{text}</Typography>
    </Box>
  );
}

export default function EntityExplorer({ demo }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const unpackedEntity = useMemo(() => {
    if (selectedEntity === null) {
      return null;
    }

    return JSON.stringify(
      selectedEntity.unpackFlattened(),
      (key, value) => typeof value === 'bigint' ? value.toString() + 'n' : value,
      2
    );
  }, [selectedEntity]);

  const highlightedEntity = useMemo(() => {
    if (!unpackedEntity) return '';
    return highlightJson(unpackedEntity);
  }, [unpackedEntity]);

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

  const handleEntityClick = (entityId) => {
    const entity = entityContainers.byId.get(entityId) || null;
    if (entity === null) return;
    setSelectedEntity(entity);
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

  const selectedEntityId = selectedEntity ? getEntityId(selectedEntity) : null;

  const hasEntities = entityClasses.length > 0;

  return (
    <Box color='text.primary' display='flex' minHeight={0}>
      {hasEntities ? (
        <>
          <Box flex={1} display='flex' flexDirection='column' overflow='hidden'>
            <Box px={1} py={0.75}>
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
                    sx: { fontSize: '0.8125rem', height: 32 },
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&.Mui-focused fieldset': { borderColor: '#7c4dff' },
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
                <Box display='flex' alignItems='center' justifyContent='space-between' px={1.5} py={0.5} sx={{ minHeight: 36 }}>
                  <Typography fontSize='0.75rem' color='text.secondary' noWrap>
                    {selectedEntity.class.name}
                    <Typography component='span' fontSize='0.75rem' color='text.disabled'>
                      {' '}/ index={selectedEntity.index}
                    </Typography>
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy JSON'} arrow>
                    <IconButton onClick={handleCopyClicked} size='small'>
                      <ContentCopyIcon sx={{ fontSize: '0.875rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Divider />

                <Box flex={1} overflow='auto' px={1.5} py={1}>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      lineHeight: 1.65,
                      fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightedEntity }}
                  />
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
