import { Parser, ParserConfiguration } from 'deadem';

import {
  Category as CategoryIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  ManageSearch as ManageSearchIcon,
  RocketLaunch as RocketLaunchIcon,
  AccountTree as AccountTreeIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Box, Chip, Divider, Link, List, ListItem, Paper, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import Navigation from './../Navigation/Navigation';

import BottomBar from './components/BottomBar/BottomBar';
import EntityExplorer from './components/EntityExplorer/EntityExplorer';
import InfoExplorer from './components/InfoExplorer/InfoExplorer';
import PacketExplorer from './components/PacketExplorer/PacketExplorer';
import UploadForm from './components/UploadForm/UploadForm';

import Player from './data/Player';

const UI_MAX_HISTORY_PACKETS = 100;
const UI_UPDATE_INTERVAL = 500;

const TABS = [
  {
    key: 'packets',
    props: {
      icon: <EmailIcon />,
      label: 'Packets',
      sx: { fontSize: '0.8125rem', minHeight: '50px' }
    },
    overflow: 'auto'
  },
  {
    key: 'entities',
    props: {
      icon: <CategoryIcon />,
      label: 'Entities',
      sx: { fontSize: '0.8125rem', minHeight: '50px' }
    },
    overflow: null
  },
  {
    key: 'info',
    props: {
      icon: <InfoIcon />,
      label: 'Info',
      sx: { fontSize: '0.8125rem', minHeight: '50px' }
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
  { icon: <ManageSearchIcon sx={{ fontSize: '1.15rem' }} />, color: '#7c4dff', title: 'Inspect Packets', description: 'Step through demo packets, view their contents as JSON.' },
  { icon: <AccountTreeIcon sx={{ fontSize: '1.15rem' }} />, color: '#00e5ff', title: 'Explore Entities', description: 'Browse game entities grouped by class and view their properties.' },
  { icon: <AssessmentIcon sx={{ fontSize: '1.15rem' }} />, color: '#69f0ae', title: 'View Game Info', description: 'Check tick rate, server settings, entity counts, and string tables.' },
];

function getInitialFileState() {
  return null;
}

function getInitialGameState() {
  return { clockGame: null, clockTotal: null, state: null, paused: null, tick: null };
}

function getInitialStatusState() {
  return { done: false, processing: false };
}

function getInitialTabIndexState() {
  return 0;
}

export default function ParserComponent() {
  const demoPacketsRef = useRef([]);
  const fileInputRef = useRef(null);
  const historyRef = useRef([]);

  const [file, setFile] = useState(getInitialFileState());
  const [game, setGame] = useState(getInitialGameState());
  const [status, setStatus] = useState(getInitialStatusState());
  const [tabIndex, setTabIndex] = useState(getInitialTabIndexState());

  const handleFileChanged = (event) => {
    const file = event.target.files[0];

    setFile(file);
  };

  const handlePacket = (demoPacket, leftCount) => {
    demoPacketsRef.current.push(demoPacket);

    if (leftCount === 0 || demoPacketsRef.current.length % UI_UPDATE_INTERVAL === 0) {
      updateUI();

      if (leftCount === 0) {
        setStatus((previous) => ({
          ...previous,
          processing: false
        }));
      }
    }
  };

  const handlePauseClicked = () => {
    player.pause();

    setStatus((previous) => ({
      ...previous,
      processing: false
    }));

    updateUI();
  };

  const handlePlayClicked = () => {
    player.play();

    setStatus((previous) => ({
      ...previous,
      processing: true
    }));
  };

  const handlePlayNClicked = (count) => {
    player.move(count);

    setStatus((previous) => ({
      ...previous,
      processing: true
    }));
  };

  const handleResetClicked = () => {
    demoPacketsRef.current = [];
    historyRef.current = [];

    setFile(getInitialFileState());
    setGame(getInitialGameState());
    setStatus(getInitialStatusState());
    setTabIndex(getInitialTabIndexState());

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleTabChanged = (event, newValue) => {
    setTabIndex(newValue);
  };

  const updateUI = () => {
    if (demoPacketsRef.current.length === 0) {
      return;
    }

    const packets = demoPacketsRef.current.slice();

    demoPacketsRef.current = [];

    packets.reverse();

    historyRef.current = [...packets, ...historyRef.current].slice(0, UI_MAX_HISTORY_PACKETS);

    player.gameObserver.forceUpdate();

    const gameFormatted = player.gameObserver.getGameFormatted();

    setGame({
      clockGame: gameFormatted.clockGame,
      clockTotal: gameFormatted.clockTotal,
      state: gameFormatted.state,
      paused: gameFormatted.paused,
      tick: gameFormatted.tick
    });
  };

  const player = useMemo(() => {
    if (file === null) {
      return null;
    }

    const parserConfiguration = new ParserConfiguration({ parserThreads: 4 });
    const parser = new Parser(parserConfiguration);
    const player = new Player(parser, file);

    player.onPacket(handlePacket);

    player.finishPromise
      .then(() => {
        updateUI();

        setStatus({ done: true, processing: false });
      });

    return player;
  }, [file]);

  useEffect(() => {
    if (player !== null) {
      setGame(player.gameObserver.getGameFormatted());
    }
  }, [player]);

  const demo = player ? player.parser.getDemo() : null;

  const tabComponents = [
    <PacketExplorer history={historyRef.current} />,
    <EntityExplorer demo={demo} />,
    <InfoExplorer demo={demo} />
  ];

  const bottomBarHeight = '60px';

  return (
    <>
      <Box alignItems='center' display='flex' justifyContent='center'>
        {file === null
          ? <UploadForm ref={fileInputRef} onFileChange={handleFileChanged} />
          : <Chip sx={{ fontSize: '0.875rem', mb: 2 }} label={file.name} onDelete={handleResetClicked} variant='outlined' />
        }
      </Box>

      {file ? (
        <>
          <Box component={Paper} display='flex' flexDirection='column' marginBottom={bottomBarHeight} minHeight={0}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Navigation
                active={tabIndex}
                onChange={handleTabChanged}
                tabs={TABS}
                tabsProps={{ indicatorColor: 'secondary', sx: { minHeight: '50px' }, textColor: 'secondary' }}
              />
            </Box>

            {tabComponents.map((component, index) => (
              tabIndex === index && (
                <Box
                  display={tabIndex === index ? 'flex' : 'none'}
                  flexDirection='column'
                  minHeight={0}
                  key={index}
                  overflow={TABS[index].overflow}
                >
                  {component}
                </Box>
              )
            ))}
          </Box>

          <BottomBar
            game={game}
            height={bottomBarHeight}
            onIncrementClick={handlePlayNClicked}
            onPauseClick={handlePauseClicked}
            onPlayClick={handlePlayClicked}
            status={status}
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
              <RocketLaunchIcon sx={{ color: '#b388ff', fontSize: '1.25rem' }} />
              <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                Getting Started
              </Typography>
            </Box>

            <Divider />

            <Typography variant='body2' color='text.secondary' mt={2} paragraph>
              <strong>Deadem</strong> is an open-source JavaScript library for parsing Deadlock demo files (<code>.dem</code>) built for Node.js and modern browsers.
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              <strong>Deadem Explorer</strong> lets you open any Deadlock replay (<code>.dem</code>) and explore its contents right in the browser.
              Upload your own file above or pick one from the <strong>Library</strong> tab.
            </Typography>

            <Typography variant='body2' color='text.secondary' fontWeight={500} mt={2} mb={1.5}>
              What you can do:
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
