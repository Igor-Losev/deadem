import {
  AccountTree as AccountTreeIcon,
  Assessment as AssessmentIcon,
  Groups as GroupsIcon,
  ManageSearch as ManageSearchIcon,
  RocketLaunch as RocketLaunchIcon
} from '@mui/icons-material';
import { Box, Divider, Link, List, ListItem, Paper, Typography } from '@mui/material';

import { COLORS } from '../../theme';

const FEATURES = [
  {
    color: COLORS.accent,
    description: 'Watch player stats update in real time as the replay plays — kills, deaths, net worth, damage, and more.',
    icon: <GroupsIcon sx={{ fontSize: '1.15rem' }} />,
    title: 'Live Scoreboard'
  },
  {
    color: COLORS.jsonBoolean,
    description: 'See the last 100 demo packets at the current position. Click any packet to inspect its full JSON payload.',
    icon: <ManageSearchIcon sx={{ fontSize: '1.15rem' }} />,
    title: 'Packet Timeline'
  },
  {
    color: '#00e5ff',
    description: 'Browse all live game entities grouped by class. Select one to view its properties updated tick by tick.',
    icon: <AccountTreeIcon sx={{ fontSize: '1.15rem' }} />,
    title: 'Entity Inspector'
  },
  {
    color: COLORS.jsonNumber,
    description: 'Check tick rate, class counts, entity counts, and string table entries.',
    icon: <AssessmentIcon sx={{ fontSize: '1.15rem' }} />,
    title: 'Server Info'
  }
];

function Feature({ color, description, icon, title }) {
  return (
    <Box display='flex' gap={1.5} alignItems='flex-start'>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: `${color}14`,
          borderRadius: '8px',
          color,
          display: 'flex',
          flexShrink: 0,
          height: 32,
          justifyContent: 'center',
          mt: '1px',
          width: 32
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant='body2' color='text.primary' fontWeight={600} lineHeight={1.3}>
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary' lineHeight={1.4} mt={0.25}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ParserLanding({ library }) {
  const links = [
    { label: 'Documentation', href: library.documentationUrl },
    { label: 'NPM', href: library.npmUrl },
    { label: 'Issues', href: library.issuesUrl },
    { label: 'Releases', href: library.releasesUrl }
  ];

  return (
    <Box display='flex' justifyContent='center' minHeight={0} mb={2}>
      <Paper elevation={0} sx={{ borderRadius: 2, maxWidth: 680, overflow: 'auto', p: 4 }}>
        <Box display='flex' alignItems='center' gap={1} mb={2}>
          <RocketLaunchIcon sx={{ color: COLORS.accent, fontSize: '1.25rem' }} />
          <Typography component='h2' variant='subtitle1' fontWeight={600} color='text.primary'>
            {library.title}
          </Typography>
        </Box>

        <Divider />

        <Typography variant='body2' color='text.secondary' mt={2} paragraph>
          {library.description}
          &nbsp;Load any replay, control playback tick by tick, and watch the game state update in real time.
        </Typography>
        <Typography variant='body2' color='text.secondary' paragraph>
          Upload a <code>.dem</code> demo file above or pick one from the <strong>Library</strong> tab.
          Use the player bar at the bottom to play, pause, seek, or step through ticks one by one.
        </Typography>

        <Box display='flex' flexDirection='column' gap={1.5}>
          {FEATURES.map((feature) => <Feature key={feature.title} {...feature} />)}
        </Box>

        <Typography variant='body2' color='text.secondary' fontWeight={500} mt={2} mb={0.5}>
          Resources
        </Typography>
        <List sx={{ listStyleType: 'disc', pl: 4, pt: 0 }}>
          {links.map((link) => (
            <ListItem key={link.label} sx={{ display: 'list-item', p: 0, pb: 0.25 }}>
              <Link href={link.href} target='_blank' underline='hover' variant='body2'>
                {link.label}
              </Link>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
