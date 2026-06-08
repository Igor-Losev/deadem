import { Box, Tab, Tabs } from '@mui/material';

export default function Navigation({ active, actions = null, onChange, tabs, tabsProps }) {
  return (
    <Box alignItems='center' display='flex' sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs onChange={onChange} value={active} {...tabsProps} sx={{ flex: 1, minWidth: 0, ...tabsProps?.sx }}>
        {tabs.map((tab, index) => (
          <Tab
            aria-controls={`tabpanel-${index}`}
            iconPosition='start'
            id={tab.key}
            key={tab.key}
            {...tab.props}
            value={index}
          />
        ))}
      </Tabs>
      {actions}
    </Box>
  );
}
