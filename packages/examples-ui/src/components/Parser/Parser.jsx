import { Parser, ParserConfiguration } from 'deadem';

import { Category as CategoryIcon, Email as EmailIcon, Info as InfoIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Chip, Divider, Link, List, ListItem, Paper, Typography } from '@mui/material';
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
      sx: { fontSize: '0.75rem', minHeight: '50px' }
    },
    overflow: 'auto'
  },
  {
    key: 'entities',
    props: {
      icon: <CategoryIcon />,
      label: 'Entities',
      sx: { fontSize: '0.75rem', minHeight: '50px' }
    },
    overflow: null
  },
  {
    key: 'info',
    props: {
      icon: <InfoIcon />,
      label: 'Info',
      sx: { fontSize: '0.75rem', minHeight: '50px' }
    },
    overflow: 'auto'
  }
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
          <Alert
            severity='info'
            variant='outlined'
            sx={{ backgroundColor: 'white', border: 'none', borderRadius: 1, boxShadow: 2, maxWidth: 600, overflowY: 'auto', paddingRight: '46px' }}
          >
            <AlertTitle color='text.secondary'>Deadem Explorer</AlertTitle>
            <Divider />
            <Typography variant='body2' color='text.secondary' marginTop={2} paragraph>
              <strong>Deadem</strong> is a JavaScript parser for Deadlock (Valve Source 2 Engine) demo/replay files, compatible with Node.js and modern browsers.
            </Typography>
            <Typography variant='body2' color='text.secondary' marginTop={2} paragraph>
              This is <strong>Deadem Explorer</strong>, a tool that showcases the capabilities of the <strong>deadem</strong> library in a simplified way. Currently, this UI supports only the parsing of demo files (with the <code>.dem</code> extension). You can select any file from the Library or upload your own.
            </Typography>
            <Typography color='text.secondary' marginBottom={0} variant='body2' paragraph>
              For more information, check out the links below:
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
              {[
                { label: 'Documentation', href: 'https://github.com/Igor-Losev/deadem/blob/main/README.md' },
                { label: 'NPM', href: 'https://www.npmjs.com/package/deadem' },
                { label: 'Issues', href: 'https://github.com/Igor-Losev/deadem/issues' },
                { label: 'Releases', href: 'https://github.com/Igor-Losev/deadem/releases' },
              ].map((item) => (
                <ListItem key={item.label} sx={{ display: 'list-item', p: 0 }}>
                  <Link
                    href={item.href}
                    target='_blank'
                    underline='hover'
                  >
                    {item.label}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Alert>
        </Box>
      )}
    </>
  );
}

