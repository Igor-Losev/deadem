import { Folder as FolderIcon, Troubleshoot as TroubleshootIcon } from '@mui/icons-material';
import { Box, Container } from '@mui/material';
import React, { useState } from 'react';

import Library from './components/Library/Library';
import Navigation from './components/Navigation/Navigation';
import Parser from './components/Parser/Parser';

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
    <Container fixed sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navigation active={tabIndex} onChange={handleTabChanged} tabs={TABS} tabsProps={{ centered: true }} />
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
