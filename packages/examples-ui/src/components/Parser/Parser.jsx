import {
  Category as CategoryIcon,
  Email as EmailIcon,
  Groups as GroupsIcon,
  Info as InfoIcon,
  ManageSearch as ManageSearchIcon,
  RocketLaunch as RocketLaunchIcon,
  AccountTree as AccountTreeIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Box, Chip, Divider, Link, List, ListItem, Paper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import Navigation from './../Navigation/Navigation';

import BottomBar from './components/BottomBar/BottomBar';
import MatchSummary from './components/MatchSummary/MatchSummary';
import EntityExplorer from './components/EntityExplorer/EntityExplorer';
import InfoExplorer from './components/InfoExplorer/InfoExplorer';
import PacketExplorer from './components/PacketExplorer/PacketExplorer';
import UploadForm from './components/UploadForm/UploadForm';

import usePlayer from './hooks/usePlayer';

import { COLORS, FONT_SIZE } from './theme';

const TABS = [
  {
    key: 'summary',
    props: {
      icon: <GroupsIcon />,
      label: 'Summary',
      sx: { fontSize: FONT_SIZE.md, minHeight: '50px' }
    },
    overflow: 'auto'
  },
  {
    key: 'packets',
    props: {
      icon: <EmailIcon />,
      label: 'Packets',
      sx: { fontSize: FONT_SIZE.md, minHeight: '50px' }
    },
    overflow: 'auto'
  },
  {
    key: 'entities',
    props: {
      icon: <CategoryIcon />,
      label: 'Entities',
      sx: { fontSize: FONT_SIZE.md, minHeight: '50px' }
    },
    overflow: null
  },
  {
    key: 'info',
    props: {
      icon: <InfoIcon />,
      label: 'Info',
      sx: { fontSize: FONT_SIZE.md, minHeight: '50px' }
    },
    overflow: 'auto'
  }
];

const LINKS = [
  { label: 'Documentation', href: 'https://github.com/Igor-Losev/deadem/blob/main/README.md' },
  { label: 'NPM', href: 'https://www.npmjs.com/package/deadem' },
  { label: 'Issues', href: 'https://github.com/Igor-Losev/deadem/issues' },
  { label: 'Releases', href: 'https://github.com/Igor-Losev/deadem/releases' },
];

const FEATURES = [
  { icon: <GroupsIcon sx={{ fontSize: '1.15rem' }} />, color: COLORS.accent, title: 'Live Scoreboard', description: 'Watch player stats update in real time as the replay plays — kills, deaths, net worth, damage, and more.' },
  { icon: <ManageSearchIcon sx={{ fontSize: '1.15rem' }} />, color: COLORS.jsonBoolean, title: 'Packet Timeline', description: 'See the last 100 demo packets at the current position. Click any packet to inspect its full JSON payload.' },
  { icon: <AccountTreeIcon sx={{ fontSize: '1.15rem' }} />, color: '#00e5ff', title: 'Entity Inspector', description: 'Browse all live game entities grouped by class. Select one to view its properties updated tick by tick.' },
  { icon: <AssessmentIcon sx={{ fontSize: '1.15rem' }} />, color: COLORS.jsonNumber, title: 'Server Info', description: 'Check tick rate, class counts, entity counts, and string table entries.' },
];

export default function ParserComponent() {
  const {
    demo, fileName, game, playing, rate, seeking, ticks, contentVersion,
    fileInputRef, historyRef,
    handleFileChanged, handleResetClicked,
    handlePlayClicked, handlePauseClicked, handleRateChange,
    handleNextTick, handlePrevTick, handleSeek,
    handleSeekToStart, handleSeekToEnd,
  } = usePlayer();

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChanged = (event, newValue) => {
    setTabIndex(newValue);
  };

  const history = useMemo(() => [...historyRef.current], [contentVersion]);

  const activeTab = useMemo(() => {
    switch (tabIndex) {
      case 0: return <MatchSummary demo={demo} />;
      case 1: return <PacketExplorer history={history} />;
      case 2: return <EntityExplorer demo={demo} contentVersion={contentVersion} />;
      case 3: return <InfoExplorer demo={demo} />;
      default: return null;
    }
  }, [demo, tabIndex, contentVersion, history]);

  const handleReset = () => {
    handleResetClicked();
    setTabIndex(0);
  };

  const bottomBarHeight = 60;

  return (
    <>
      <Box alignItems='center' display='flex' justifyContent='center'>
        {fileName === null
          ? <UploadForm ref={fileInputRef} onFileChange={handleFileChanged} />
          : <Chip sx={{ fontSize: FONT_SIZE.lg, mb: 2 }} label={fileName} onDelete={handleReset} variant='outlined' />
        }
      </Box>

      {fileName ? (
        <>
          <Box component={Paper} display='flex' flexDirection='column' marginBottom={`${bottomBarHeight + 20}px`} minHeight={0}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Navigation
                active={tabIndex}
                onChange={handleTabChanged}
                tabs={TABS}
                tabsProps={{ indicatorColor: 'secondary', sx: { minHeight: '50px' }, textColor: 'secondary' }}
              />
            </Box>

            <Box
              display='flex'
              flexDirection='column'
              minHeight={0}
              overflow={TABS[tabIndex].overflow}
            >
              {activeTab}
            </Box>
          </Box>

          <BottomBar
            demo={demo}
            game={game}
            height={bottomBarHeight}
            onNextTick={handleNextTick}
            onPauseClick={handlePauseClicked}
            onPlayClick={handlePlayClicked}
            onPrevTick={handlePrevTick}
            onRateChange={handleRateChange}
            onSeek={handleSeek}
            onSeekToEnd={handleSeekToEnd}
            onSeekToStart={handleSeekToStart}
            playing={playing}
            rate={rate}
            seeking={seeking}
            ticks={ticks}
          />
        </>
      ) : (
        <Box display='flex' justifyContent='center' minHeight={0} marginY={2}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              maxWidth: 680,
              overflow: 'auto',
              p: 4
            }}
          >
            <Box display='flex' alignItems='center' gap={1} mb={2}>
              <RocketLaunchIcon sx={{ color: COLORS.accent, fontSize: '1.25rem' }} />
              <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                Deadem Explorer
              </Typography>
            </Box>

            <Divider />

            <Typography variant='body2' color='text.secondary' mt={2} paragraph>
              A Deadlock replay viewer powered by <strong>deadem</strong> — an open-source JavaScript library for parsing and playing back Deadlock demo files (<code>.dem</code>) in Node.js and the browser.
              Load any replay, control playback tick by tick, and watch the game state update in real time.
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              Upload a <code>.dem</code> demo file above or pick one from the <strong>Library</strong> tab.
              Use the player bar at the bottom to play, pause, seek, or step through ticks one by one.
            </Typography>

            <Box display='flex' flexDirection='column' gap={1.5}>
              {FEATURES.map((feature) => (
                <Box key={feature.title} display='flex' gap={1.5} alignItems='flex-start'>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: `${feature.color}14`,
                      color: feature.color,
                      flexShrink: 0,
                      mt: '1px',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.primary' fontWeight={600} lineHeight={1.3}>
                      {feature.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' lineHeight={1.4} mt={0.25}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Typography variant='body2' color='text.secondary' fontWeight={500} mt={2} mb={0.5}>
              Resources
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4, pt: 0 }}>
              {LINKS.map((item) => (
                <ListItem key={item.label} sx={{ display: 'list-item', p: 0, pb: 0.25 }}>
                  <Link
                    href={item.href}
                    target='_blank'
                    underline='hover'
                    variant='body2'
                  >
                    {item.label}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </>
  );
}
