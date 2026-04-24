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

const PACKAGE_LINKS = [
  {
    description: 'Shared parser engine',
    href: 'https://www.npmjs.com/package/@deademx/engine',
    label: '@deademx/engine'
  },
  {
    description: 'Deadlock parser and replay player',
    href: 'https://www.npmjs.com/package/deadem',
    label: 'deadem'
  },
  {
    description: 'Dota 2 parser and replay player',
    href: 'https://www.npmjs.com/package/@deademx/dota2',
    label: '@deademx/dota2'
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

function SectionHeading({ label, mt = 2 }) {
  return (
    <Box alignItems='center' display='flex' gap={1.25} mt={mt} mb={1}>
      <Typography
        color='text.primary'
        fontSize='0.75rem'
        fontWeight={700}
        letterSpacing='0.08em'
        textTransform='uppercase'
      >
        {label}
      </Typography>
      <Divider sx={{ borderColor: `${COLORS.accent}44`, flex: 1 }} />
    </Box>
  );
}

function PackageLink({ description, href, label }) {
  return (
    <Link
      href={href}
      sx={{ borderRadius: 2, color: 'inherit', display: 'block' }}
      target='_blank'
      underline='none'
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          height: '100%',
          px: 1.5,
          py: 1.25,
          transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            backgroundColor: `${COLORS.accent}18`,
            borderColor: `${COLORS.accent}88`,
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Typography
          variant='body2'
          color='text.primary'
          fontFamily='monospace'
          fontWeight={600}
          sx={{ wordBreak: 'break-word' }}
        >
          {label}
        </Typography>
        <Typography variant='caption' color='text.secondary' lineHeight={1.4}>
          {description}
        </Typography>
      </Box>
    </Link>
  );
}

export default function ParserLanding({ library }) {
  const resourceLinks = [
    { label: 'Documentation', href: library.documentationUrl },
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

        <SectionHeading label='Packages on npm' />
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: {
              sm: 'repeat(2, minmax(0, 1fr))',
              xs: '1fr'
            }
          }}
        >
          {PACKAGE_LINKS.map((packageLink) => (
            <PackageLink
              key={packageLink.label}
              {...packageLink}
            />
          ))}
        </Box>

        <SectionHeading label='Project' />
        <List sx={{ listStyleType: 'disc', pl: 4, pt: 0 }}>
          {resourceLinks.map((link) => (
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
