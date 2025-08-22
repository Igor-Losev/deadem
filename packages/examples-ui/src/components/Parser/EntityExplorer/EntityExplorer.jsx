import { DataObjectOutlined as DataObjectOutlinedIcon } from '@mui/icons-material';
import { Box, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RichTreeView, TreeItem, treeItemClasses } from '@mui/x-tree-view';
import { useMemo, useState } from 'react';

function getEntityId(entity) {
  return `${entity.class.id}-${entity.index}-${entity.serial}`;
}

const EntityTreeItem = styled(TreeItem)({
  [`& .${treeItemClasses.content}`]: {
    borderRadius: 0
  },

  [`& .${treeItemClasses.groupTransition}`]: {
    borderLeft: '1px dashed rgba(0, 0, 0, 0.12)',
    marginLeft: 15,
  },

  [`& .${treeItemClasses.iconContainer} svg`]: {
    color: '#4d4d4d',
    fontSize: '16px'
  },

  [`& .${treeItemClasses.label}`]: {
    fontSize: '0.875rem'
  },

  [`& .${treeItemClasses.root} .${treeItemClasses.content}`]: {

  }
});

export default function EntityExplorer({ demo }) {
  const [selectedEntity, setSelectedEntity] = useState(null);

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
  };

  const entityClasses = Array.from(entityContainers.byClass.keys());

  entityClasses.sort((a, b) => a.name.localeCompare(b.name));

  const tree = entityClasses.map((entityClass, entityClassIndex) => {
    const entities = entityContainers.byClass.get(entityClass);

    return {
      id: entityClass.id,
      label: `#${entityClassIndex + 1} ${entityClass.name} (id = ${entityClass.id})`, // + count
      children: entities.map((entity, entityIndex) => ({
        id: getEntityId(entity),
        label: `#${entityIndex + 1} (index = ${entity.index}, active = ${entity.active}, serial = ${entity.serial})`
      }))
    };
  });

  return (
    <Box color='text.primary' display='flex' minHeight={0}>
      <Box flex={1} fontWeight='0.875rem' overflow='auto'>
        <RichTreeView
          items={tree}
          onItemClick={handleTreeItemClick}
          slots={{
            endIcon: DataObjectOutlinedIcon,
            item: EntityTreeItem
          }}
        >
        </RichTreeView>
      </Box>

      <Divider orientation='vertical' flexItem />

      <Box flex={1} overflow='auto' padding={1}>
        <Box component='pre' margin={0}>
          <Typography fontSize='0.875rem'>{unpackedEntity}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

