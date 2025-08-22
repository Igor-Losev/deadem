import { InterceptorStage, Parser } from 'deadem';

import { Category as CategoryIcon, Email as EmailIcon, Info as InfoIcon } from '@mui/icons-material';
import { Box, Chip, Paper } from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import EntityExplorer from './EntityExplorer/EntityExplorer';
import InfoExplorer from './InfoExplorer/InfoExplorer';
import Navigation from './../Navigation/Navigation';
import PacketExplorer from './PacketExplorer/PacketExplorer';
import UploadForm from './UploadForm/UploadForm';

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

let parser = null;

let iterations = 0;

export default function ParserComponent() {
  const fileInputRef = useRef();

  const [demo, setDemo] = useState(null);
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  const addHistory = (demoPacket) => {
    setHistory((prev) => [...prev, demoPacket]);
  };

  const handleFileChanged = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTabChanged = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleResetClicked = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  useMemo(() => {
    if (file === null) {
      parser = null;

      return null;
    }

    if (parser !== null) {
      return parser;
    }

    parser = new Parser();

    parser.registerPreInterceptor(InterceptorStage.DEMO_PACKET, async (demoPacket) => {
      if (history.length !== 0 && history[history.length - 1].sequence >= demoPacket.sequence) {
        return;
      }

      if (iterations > 99) {
        return new Promise((resolve) => { });
      }

      iterations += 1;

      addHistory(demoPacket);
      setDemo(parser.getDemo());
    });

    parser.parse(file.stream());
  }, [file]);

  const tabComponents = [
    <PacketExplorer history={history} />,
    <EntityExplorer demo={demo} />,
    <InfoExplorer demo={demo} />
  ];

  return (
    <>
      <Box alignItems='center' display='flex' justifyContent='center'>
        {file === null
          ? <UploadForm ref={fileInputRef} onChange={handleFileChanged} />
          : <Chip sx={{ fontSize: '0.875rem', mb: 2 }} label={file.name} onDelete={handleResetClicked} variant='outlined' />
        }
      </Box>

      {file && parser !== null &&
        <Box component={Paper} display='flex' flexDirection='column' minHeight={0}>
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
      }
    </>
  );
}

