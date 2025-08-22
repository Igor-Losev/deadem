import { Box, Tabs, Tab } from '@mui/material';

export default function Navigation({ active, onChange, tabs, tabsProps }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={active} onChange={onChange} {...tabsProps}>
        {tabs.map((tab, index) => (
          <Tab
            aria-controls={`tabpanel-${index}`}
            id={tab.key}
            iconPosition='start'
            key={tab.key}
            {...tab.props}
            value={index}
          />
        ))}
      </Tabs>
    </Box>
  );
}

