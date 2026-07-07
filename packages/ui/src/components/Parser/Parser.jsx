import {
  Category as CategoryIcon,
  CompareArrows as CompareArrowsIcon,
  Email as EmailIcon,
  Groups as GroupsIcon,
  Info as InfoIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { Alert, Box, Chip, Paper, Snackbar } from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import Navigation from './../Navigation/Navigation';

import BottomBar from './components/BottomBar/BottomBar';
import Cs2GameInfo from './components/BottomBar/Cs2GameInfo';
import EntityDiff from './components/EntityDiff/EntityDiff';
import EntityExplorer from './components/EntityExplorer/EntityExplorer';
import FreezeToggle from './components/FreezeToggle/FreezeToggle';
import InfoExplorer from './components/InfoExplorer/InfoExplorer';
import MatchSummary from './components/MatchSummary/MatchSummary';
import PacketExplorer from './components/PacketExplorer/PacketExplorer';
import ParserLanding from './components/ParserLanding/ParserLanding';
import StringTables from './components/StringTables/StringTables';
import UploadForm from './components/UploadForm/UploadForm';

import usePlayer from './hooks/usePlayer';

import { FONT_SIZE } from './theme';

const BOTTOM_BAR_HEIGHT = 60;
const CS2_GAME_INFO_HEIGHT = 32;

const TAB_STYLE = { fontSize: FONT_SIZE.md, minHeight: '50px' };

const TABS = [
  {
    key: 'summary',
    overflow: 'auto',
    props: { icon: <GroupsIcon />, label: 'Summary', sx: TAB_STYLE }
  },
  {
    key: 'packets',
    overflow: 'auto',
    props: { icon: <EmailIcon />, label: 'Packets', sx: TAB_STYLE }
  },
  {
    key: 'entities',
    overflow: null,
    props: { icon: <CategoryIcon />, label: 'Entities', sx: TAB_STYLE }
  },
  {
    key: 'stringtables',
    overflow: null,
    props: { icon: <StorageIcon />, label: 'Tables', sx: TAB_STYLE }
  },
  {
    key: 'diff',
    overflow: null,
    props: { icon: <CompareArrowsIcon />, label: 'Diff', sx: TAB_STYLE }
  },
  {
    key: 'info',
    overflow: 'auto',
    props: { icon: <InfoIcon />, label: 'Info', sx: TAB_STYLE }
  }
];

function TabPanel({ active, children }) {
  const frozen = useRef(children);

  if (active) {
    frozen.current = children;
  }

  return <Box display={active ? 'contents' : 'none'}>{frozen.current}</Box>;
}

export default function Parser({ isVisible = true, library, onLibraryChange }) {
  const [tabIndex, setTabIndex] = useState(0);

  const isCs2 = library?.gameCode === 'cs2';

  const {
    demo, fileName, fileHeader, playing, rate, seeking, ticks, tickStore, contentVersion, playerError, frozen,
    fileInputRef, historyRef, entityDiffRef,
    clearPlayerError, toggleFrozen,
    handleFileChanged, handleResetClicked,
    handlePlayClicked, handlePauseClicked, handleRateChange,
    handleNextTick, handlePrevTick, handleSeek,
    handleSeekToStart, handleSeekToEnd
  } = usePlayer(library, isVisible);

  const bottomBarOffset = BOTTOM_BAR_HEIGHT + (isCs2 ? CS2_GAME_INFO_HEIGHT : 0);

  const handleTabChanged = (event, newValue) => setTabIndex(newValue);

  const history = useMemo(() => [...historyRef.current], [contentVersion]);

  const diff = useMemo(() => ({
    events: [...entityDiffRef.current.events],
    fullSnapshot: entityDiffRef.current.fullSnapshot,
    prevTick: entityDiffRef.current.prevTick,
    tick: entityDiffRef.current.tick
  }), [contentVersion]);

  const gameInfo = useMemo(
    () => isCs2 ? <Cs2GameInfo demo={demo} fileHeader={fileHeader} /> : null,
    [isCs2, demo, fileHeader, contentVersion]
  );

  const handleReset = () => {
    handleResetClicked();
    setTabIndex(0);
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={5000}
        key={playerError?.id}
        onClose={clearPlayerError}
        open={Boolean(playerError)}
      >
        <Alert
          onClose={clearPlayerError}
          severity='error'
          sx={{ alignItems: 'center', width: '100%' }}
          variant='filled'
        >
          {playerError?.message}
        </Alert>
      </Snackbar>

      <Box alignItems='center' display='flex' justifyContent='center' mb={2}>
        <Box alignItems='center' display='flex' gap={1.5}>
          {fileName === null
            ? <UploadForm library={library} onFileChange={handleFileChanged} onLibraryChange={onLibraryChange} ref={fileInputRef} />
            : <Chip sx={{ fontSize: FONT_SIZE.lg }} label={fileName} onDelete={handleReset} variant='outlined' />
          }
        </Box>
      </Box>

      {fileName ? (
        <>
          <Box component={Paper} display='flex' flexDirection='column' marginBottom={`${bottomBarOffset + 20}px`} minHeight={0}>
            <Navigation
              actions={<FreezeToggle frozen={frozen} onToggle={toggleFrozen} />}
              active={tabIndex}
              onChange={handleTabChanged}
              tabs={TABS}
              tabsProps={{ allowScrollButtonsMobile: true, indicatorColor: 'secondary', scrollButtons: 'auto', sx: { minHeight: '50px' }, textColor: 'secondary', variant: 'scrollable' }}
            />

            <Box display='flex' flexDirection='column' minHeight={0} overflow={TABS[tabIndex].overflow}>
              <Box display={tabIndex === 0 ? 'contents' : 'none'}>
                <MatchSummary active={tabIndex === 0} demo={demo} library={library} tickStore={tickStore} contentVersion={contentVersion} />
              </Box>
              <TabPanel active={tabIndex === 1}>
                <PacketExplorer history={history} />
              </TabPanel>
              <TabPanel active={tabIndex === 2}>
                <EntityExplorer demo={demo} contentVersion={contentVersion} />
              </TabPanel>
              <TabPanel active={tabIndex === 3}>
                <StringTables contentVersion={contentVersion} demo={demo} />
              </TabPanel>
              <TabPanel active={tabIndex === 4}>
                <EntityDiff diff={diff} />
              </TabPanel>
              <TabPanel active={tabIndex === 5}>
                <InfoExplorer demo={demo} fileHeader={fileHeader} />
              </TabPanel>
            </Box>
          </Box>

          <BottomBar
            demo={demo}
            gameInfo={gameInfo}
            height={BOTTOM_BAR_HEIGHT}
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
            tickStore={tickStore}
          />
        </>
      ) : (
        <ParserLanding library={library} />
      )}
    </>
  );
}
