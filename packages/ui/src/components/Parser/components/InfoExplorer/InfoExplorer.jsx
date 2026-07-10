import { Grid } from '@mui/material';

import Widget, { formatValue } from './../Widget/Widget';

function formatFixedNumber(value, digits) {
  if (typeof value !== 'number') {
    return value;
  }

  return formatValue(Number(value.toFixed(digits)));
}

const GENERAL_COLUMNS = [
  { label: 'Class Baselines', selector: (stats) => stats.classBaselines },
  { label: 'Classes', selector: (stats) => stats.classes },
  { label: 'Entities', selector: (stats) => stats.entities },
  { label: 'Serializers', selector: (stats) => stats.serializers }
];

const SERVER_COLUMNS = [
  { label: 'Max Clients', selector: (server) => server.maxClients },
  { label: 'Max Classes', selector: (server) => server.maxClasses },
  { label: 'Class ID Size (bits)', selector: (server) => server.classIdSizeBits },
  { label: 'Tick Interval', selector: (server) => server.tickInterval, format: (value) => formatFixedNumber(value, 5) },
  { label: 'Tick Rate', selector: (server) => server.tickRate }
];

const REPLAY_COLUMNS = [
  { label: 'Map', selector: (header) => header.mapName },
  { label: 'Server', selector: (header) => header.serverName },
  { label: 'Client', selector: (header) => header.clientName },
  { label: 'Game Directory', selector: (header) => header.gameDirectory },
  { label: 'Build', selector: (header) => header.buildNum },
  { label: 'Demo Version', selector: (header) => header.demoVersionName },
  { label: 'Patch', selector: (header) => header.patchVersion },
  { label: 'Addons', selector: (header) => header.addons }
];

export default function InfoExplorer({ demo, fileHeader }) {
  const server = demo?.server ?? null;
  const general = demo?.getStats() ?? null;

  return (
    <Grid container padding={2} spacing={3} justifyContent='space-around'>
      <Grid size={{ sm: 6, xs: 12 }}>
        <Widget header='General' columns={GENERAL_COLUMNS} data={general} />
      </Grid>
      <Grid size={{ sm: 6, xs: 12 }}>
        <Widget header='Server' columns={SERVER_COLUMNS} data={server} />
      </Grid>
      <Grid size={12}>
        <Widget header='File Header' columns={REPLAY_COLUMNS} data={fileHeader ?? null} valueAlign='left' />
      </Grid>
    </Grid>
  );
}
