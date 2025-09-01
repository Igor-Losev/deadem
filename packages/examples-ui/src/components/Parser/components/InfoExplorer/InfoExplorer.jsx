import { Grid } from '@mui/material';

import Widget from './../Widget/Widget';

const ColumnsForGeneral = [
  {
    label: 'Class Baselines',
    selector: s => s.classBaselines
  },
  {
    label: 'Classes',
    selector: s => s.classes
  },
  {
    label: 'Entities',
    selector: s => s.entities
  },
  {
    label: 'Serializers',
    selector: s => s.serializers
  }
];

const ColumnsForServer = [
  {
    label: 'Max Clients',
    selector: s => s.maxClients
  },
  {
    label: 'Class ID Size (bits)',
    selector: s => s.classIdSizeBits
  },
  {
    label: 'Tick Interval',
    selector: s => s.tickInterval
  },
  {
    label: 'Tick Rate',
    selector: s => s.tickRate
  }
];

export default function InfoExplorer({ demo }) {
  const server = demo ? demo.server : null;
  const general = demo ? demo.getStats() : null;

  let stringTables;

  if (demo) {
    const tables = demo.stringTableContainer.getTables();

    if (tables.length > 0) {
      stringTables = tables;
    } else {
      stringTables = null;
    }
  } else {
    stringTables = null;
  }

  const columnsForStringTables = (stringTables || [ ]).map((stringTable, i) => ({
    label: stringTable.type.code,
    selector: stringTables => stringTables[i].getEntriesCount()
  }));

  return (
    <Grid padding={2} container spacing={3} justifyContent='space-around'>
      { <Grid size={{ md: 4, sm: 6, xs: 12 }}><Widget header='General' columns={ColumnsForGeneral} data={general} /></Grid> }
      { <Grid size={{ md: 4, sm: 6, xs: 12 }}><Widget header='Server' columns={ColumnsForServer} data={server} /></Grid> }
      { <Grid size={{ md: 4, sm: 12, xs: 12 }}><Widget header='String Table Entries' columns={columnsForStringTables} data={stringTables} /></Grid> }
    </Grid>
  );
}

