import { Folder as FolderIcon, GitHub as GitHubIcon, Troubleshoot as TroubleshootIcon } from '@mui/icons-material';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useState } from 'react';

import Library from './components/Library/Library';
import Navigation from './components/Navigation/Navigation';
import Parser from './components/Parser/Parser';

import packageJson from './../package.json';

const TABS = [
  {
    component: <Parser />,
    key: 'parser',
    props: {
      icon: <TroubleshootIcon />,
      label: 'Parser',
      sx: { fontSize: '0.875rem', minHeight: '50px' }
    }
  },
  {
    component: <Library />,
    key: 'library',
    props: {
      icon: <FolderIcon />,
      label: 'Library',
      sx: { fontSize: '0.875rem', minHeight: '50px' }
    }
  }
];

function App() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChanged = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '1200px', width: '100%',
        overflow: 'hidden'
      }}>

      <Box display='flex'>
        <Box alignItems='center' display='flex' flex={1} justifyContent='flex-start'>
        </Box>

        <Navigation active={tabIndex} onChange={handleTabChanged} tabs={TABS} tabsProps={{ centered: true }} />

        <Box alignItems='center' display='flex' flex={1} justifyContent='flex-end'>
          <Typography color='gray' fontSize='0.875rem' marginRight={1}>v{packageJson.version}</Typography>
          <IconButton 
            href='https://github.com/Igor-Losev/deadem'
            sx={{ '&:hover svg': { fill: 'black' } }} 
            target='_blank'
          >
            <GitHubIcon />
          </IconButton>
        </Box>
      </Box>

      {TABS.map((tab, index) => (
        <Box
          key={tab.key}
          sx={{
            backgroundColor: 'hsla(215, 15%, 97%, 0.5)',
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
    </Container>
  );
}

export default App;
