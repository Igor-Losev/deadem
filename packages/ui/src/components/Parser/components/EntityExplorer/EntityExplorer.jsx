import {
  Category as CategoryIcon,
  DataObject as DataObjectIcon,
  SearchOff as SearchOffIcon
} from '@mui/icons-material';
import { Box, Divider, InputAdornment, TextField } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import EmptyState from './../EmptyState';

import { COLORS, FONT_SIZE } from './../../theme';

import EntityDetails from './EntityDetails';
import EntityTree from './EntityTree';

import { groupEntities, stringifyEntity } from './entities';

export default function EntityExplorer({ demo, contentVersion }) {
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const entityContainers = useMemo(
    () => groupEntities(demo ? demo.getEntities() : []),
    [demo, contentVersion]
  );

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
