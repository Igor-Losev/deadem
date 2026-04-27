import { Folder as FolderIcon, GitHub as GitHubIcon, Troubleshoot as TroubleshootIcon } from '@mui/icons-material';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useState } from 'react';

import Library from './components/Library/Library';
import Navigation from './components/Navigation/Navigation';
import Parser from './components/Parser/Parser';

import { LIBRARIES, getLibraryByKey } from './libraries';

import packageJson from './../package.json';

const TAB_SX = { fontSize: '1rem', minHeight: '50px', '& .MuiTab-iconWrapper': { fontSize: '1.4rem' } };

function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [libraryKey, setLibraryKey] = useState(LIBRARIES[0].key);

  const activeLibrary = getLibraryByKey(libraryKey);

  const handleTabChanged = (event, newValue) => setTabIndex(newValue);
  const handleLibraryChanged = (event) => setLibraryKey(event.target.value);

  const tabs = [
    {
      key: 'parser',
      component: <Parser library={activeLibrary} onLibraryChange={handleLibraryChanged} />,
      props: { icon: <TroubleshootIcon />, label: 'Parser', sx: TAB_SX }
    },
    {
      key: 'library',
      component: <Library />,
      props: { icon: <FolderIcon />, label: 'Library', sx: TAB_SX }
    }
  ];

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '1200px',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      <Box component='header' display='flex' alignItems='center' sx={{ minHeight: '56px' }}>
        <Box alignItems='center' display='flex' flex={1} gap={1} justifyContent='flex-start'>
          <TroubleshootIcon sx={{ color: '#b388ff', fontSize: '1.5rem' }} />
          <Typography
            aria-label='Deadem Explorer - Deadlock and Dota 2 Demo Parser'
            component='h1'
            sx={{
              color: 'text.primary',
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap'
            }}
          >
            Deadem Explorer
          </Typography>
        </Box>

        <Box component='nav'>
          <Navigation active={tabIndex} onChange={handleTabChanged} tabs={tabs} tabsProps={{ centered: true }} />
        </Box>

        <Box alignItems='center' display='flex' flex={1} gap={1.5} justifyContent='flex-end'>
          <Typography color='text.secondary' fontSize='0.875rem'>v{packageJson.version}</Typography>
          <IconButton
            aria-label='GitHub repository'
            href='https://github.com/Igor-Losev/deadem'
            size='small'
            sx={{ '&:hover svg': { color: 'text.primary' } }}
            target='_blank'
          >
            <GitHubIcon sx={{ fontSize: '1.4rem' }} />
          </IconButton>
        </Box>
      </Box>

      <Box component='main' display='flex' flex={1} flexDirection='column' minHeight={0}>
        {tabs.map((tab, index) => (
          <Box
            key={tab.key}
            sx={{
              backgroundColor: 'transparent',
              display: tabIndex === index ? 'flex' : 'none',
              flex: 1,
              flexDirection: 'column',
              minHeight: 0,
              paddingX: 4,
              paddingY: 2
            }}
          >
            {tab.component}
          </Box>
        ))}
      </Box>
    </Container>
  );
}

export default App;
