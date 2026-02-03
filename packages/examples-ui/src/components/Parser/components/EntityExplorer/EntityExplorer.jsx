import { ContentCopy as ContentCopyIcon, DataObjectOutlined as DataObjectOutlinedIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RichTreeView, TreeItem, treeItemClasses, useTreeItemUtils } from '@mui/x-tree-view';
import { createContext, forwardRef, useCallback, useContext, useMemo, useState } from 'react';

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

const StyledLabelsContext = createContext(new Map());

const StyledTreeItem = styled(
  forwardRef(function StyledTreeItem(props, ref) {
    const labelsMap = useContext(StyledLabelsContext);
    const styledLabel = labelsMap.get(props.itemId) || props.label;
    return <TreeItem ref={ref} {...props} label={styledLabel} />;
  })
)({
  [`& .${treeItemClasses.content}`]: {
    borderRadius: 0
  },

  [`& .${treeItemClasses.groupTransition}`]: {
    borderLeft: '1px dashed rgba(255, 255, 255, 0.12)',
    marginLeft: 15,
  },

  [`& .${treeItemClasses.iconContainer} svg`]: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '16px'
  },

  [`& .${treeItemClasses.label}`]: {
    fontSize: '0.875rem'
  },
});

export default function EntityExplorer({ demo }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleTreeItemClick = (event, classOrEntityId) => {
    const entity = entityContainers.byId.get(classOrEntityId) || null;

    if (entity === null) {
      return;
    }

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

  const styledLabels = useMemo(() => new Map(), [demo]);

  const tree = entityClasses.map((entityClass, entityClassIndex) => {
    const entities = entityContainers.byClass.get(entityClass);
    const color = CLASS_COLOR;
    const classId = entityClass.id;

    styledLabels.set(classId, (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color, fontWeight: 600 }}>{entityClass.name}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>id {classId}</span>
        <span style={{
          backgroundColor: `${color}22`,
          color,
          fontSize: '0.6875rem',
          fontWeight: 600,
          padding: '0 5px',
          borderRadius: 8,
          lineHeight: '18px',
        }}>
          {entities.length}
        </span>
      </span>
    ));

    return {
      id: classId,
      label: entityClass.name,
      children: entities.map((entity, entityIndex) => {
        const entityId = getEntityId(entity);

        styledLabels.set(entityId, (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
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
          </span>
        ));

        return {
          id: entityId,
          label: `#${entityIndex + 1} index=${entity.index}`,
        };
      })
    };
  });

  return (
    <Box color='text.primary' display='flex' minHeight={0}>
      {tree.length > 0 ? (
        <>
          <Box flex={1} fontWeight='0.875rem' overflow='auto'>
            <StyledLabelsContext.Provider value={styledLabels}>
              <RichTreeView
                items={tree}
                onItemClick={handleTreeItemClick}
                slots={{
                  endIcon: DataObjectOutlinedIcon,
                  item: StyledTreeItem
                }}
              />
            </StyledLabelsContext.Provider>
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
              <Box display='flex' alignItems='center' justifyContent='center' flex={1}>
                <Typography color='text.secondary' fontSize='0.875rem'>No data.</Typography>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box alignItems='center' display='flex' justifyContent='center' minHeight={140} width='100%'>
          <Typography color='text.secondary' fontSize='0.875rem'>No data.</Typography>
        </Box>
      )}
    </Box>
  );
}
