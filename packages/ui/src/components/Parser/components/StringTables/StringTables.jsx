import { Storage as StorageIcon, TableRows as TableRowsIcon } from '@mui/icons-material';
import { Box, Divider } from '@mui/material';
import { useMemo, useState } from 'react';

import EmptyState from './../EmptyState';

import EntryPanel from './EntryPanel';
import TableList from './TableList';

export default function StringTables({ contentVersion, demo }) {
  const [selectedTableId, setSelectedTableId] = useState(null);

  const tables = useMemo(() => {
    const list = demo ? demo.stringTableContainer.getTables() : [];

    return [...list].sort((left, right) => left.type.code.localeCompare(right.type.code));
  }, [demo, contentVersion]);

  if (tables.length === 0) {
    return (
      <Box color='text.primary' display='flex' minHeight={0}>
        <EmptyState
          icon={<StorageIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
          text='No string tables available'
        />
      </Box>
    );
  }

  const selectedTable = selectedTableId !== null
    ? tables.find((table) => table.id === selectedTableId) ?? null
    : null;

  return (
    <Box color='text.primary' display='flex' minHeight={0}>
      <TableList onSelect={setSelectedTableId} selectedTableId={selectedTableId} tables={tables} />

      <Divider orientation='vertical' flexItem />

      <Box display='flex' flex={1} flexDirection='column' minWidth={0} overflow='hidden'>
        {selectedTable ? (
          <EntryPanel key={selectedTable.id} contentVersion={contentVersion} table={selectedTable} />
        ) : (
          <EmptyState
            icon={<TableRowsIcon sx={{ fontSize: '1.5rem', color: 'text.disabled' }} />}
            text='Select a table to view its entries'
          />
        )}
      </Box>
    </Box>
  );
}
