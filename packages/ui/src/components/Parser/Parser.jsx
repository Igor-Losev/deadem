import {
  Category as CategoryIcon,
  Email as EmailIcon,
  Groups as GroupsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Alert, Box, Chip, Paper, Snackbar } from '@mui/material';
import { useMemo, useState } from 'react';

import Navigation from './../Navigation/Navigation';

import BottomBar from './components/BottomBar/BottomBar';
import EntityExplorer from './components/EntityExplorer/EntityExplorer';
import InfoExplorer from './components/InfoExplorer/InfoExplorer';
import MatchSummary from './components/MatchSummary/MatchSummary';
import PacketExplorer from './components/PacketExplorer/PacketExplorer';
import ParserLanding from './components/ParserLanding/ParserLanding';
import UploadForm from './components/UploadForm/UploadForm';

import usePlayer from './hooks/usePlayer';

import { FONT_SIZE } from './theme';

const BOTTOM_BAR_HEIGHT = 60;

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
    key: 'info',
    overflow: 'auto',
    props: { icon: <InfoIcon />, label: 'Info', sx: TAB_STYLE }
  }
];

export default function Parser({ library, onLibraryChange }) {
  const {
    demo, fileName, playing, rate, seeking, ticks, contentVersion, playerError,
    fileInputRef, historyRef,
    clearPlayerError,
    handleFileChanged, handleResetClicked,
    handlePlayClicked, handlePauseClicked, handleRateChange,
    handleNextTick, handlePrevTick, handleSeek,
    handleSeekToStart, handleSeekToEnd
  } = usePlayer(library);

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChanged = (event, newValue) => setTabIndex(newValue);

  const history = useMemo(() => [...historyRef.current], [contentVersion]);

  const activeTab = useMemo(() => {
    switch (tabIndex) {
      case 0: return <MatchSummary demo={demo} library={library} />;
      case 1: return <PacketExplorer history={history} />;
      case 2: return <EntityExplorer demo={demo} contentVersion={contentVersion} />;
      case 3: return <InfoExplorer demo={demo} />;
      default: return null;
    }
  }, [demo, library, tabIndex, contentVersion, history]);

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
          <Box component={Paper} display='flex' flexDirection='column' marginBottom={`${BOTTOM_BAR_HEIGHT + 20}px`} minHeight={0}>
            <Navigation
              active={tabIndex}
              onChange={handleTabChanged}
              tabs={TABS}
              tabsProps={{ indicatorColor: 'secondary', sx: { minHeight: '50px' }, textColor: 'secondary' }}
            />

            <Box display='flex' flexDirection='column' minHeight={0} overflow={TABS[tabIndex].overflow}>
              {activeTab}
            </Box>
          </Box>

          <BottomBar
            demo={demo}
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
          />
        </>
      ) : (
        <ParserLanding library={library} />
      )}
    </>
  );
}
