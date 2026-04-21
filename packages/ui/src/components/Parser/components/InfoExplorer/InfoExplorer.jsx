import { Grid } from '@mui/material';

import Widget from './../Widget/Widget';

const GENERAL_COLUMNS = [
  { label: 'Class Baselines', selector: (stats) => stats.classBaselines },
  { label: 'Classes', selector: (stats) => stats.classes },
  { label: 'Entities', selector: (stats) => stats.entities },
  { label: 'Serializers', selector: (stats) => stats.serializers }
];

const SERVER_COLUMNS = [
  { label: 'Max Clients', selector: (server) => server.maxClients },
  { label: 'Class ID Size (bits)', selector: (server) => server.classIdSizeBits },
  { label: 'Tick Interval', selector: (server) => server.tickInterval },
  { label: 'Tick Rate', selector: (server) => server.tickRate }
];

function buildStringTableColumns(tables) {
  return tables.map((table, index) => ({
    label: table.type.code,
    selector: (source) => source[index].getEntriesCount()
  }));
}

export default function InfoExplorer({ demo }) {
  const server = demo?.server ?? null;
  const general = demo?.getStats() ?? null;
  const tables = demo?.stringTableContainer?.getTables() ?? [];
  const stringTables = tables.length > 0 ? tables : null;
  const stringTableColumns = buildStringTableColumns(tables);

  return (
    <Grid container padding={2} spacing={3} justifyContent='space-around'>
      <Grid size={{ md: 4, sm: 6, xs: 12 }}>
        <Widget header='General' columns={GENERAL_COLUMNS} data={general} />
      </Grid>
      <Grid size={{ md: 4, sm: 6, xs: 12 }}>
        <Widget header='Server' columns={SERVER_COLUMNS} data={server} />
      </Grid>
      <Grid size={{ md: 4, sm: 12, xs: 12 }}>
        <Widget header='String Table Entries' columns={stringTableColumns} data={stringTables} />
      </Grid>
    </Grid>
  );
}
