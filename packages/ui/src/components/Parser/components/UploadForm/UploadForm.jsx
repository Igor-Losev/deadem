import { ArrowDropDown as ArrowDropDownIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import { Box, Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Tooltip } from '@mui/material';
import { forwardRef, useRef, useState } from 'react';

import { LIBRARIES } from '../../../../libraries';

const BUTTON_WIDTH = 132;

const UploadForm = forwardRef(({ library, onFileChange, onLibraryChange }, ref) => {
  const anchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = () => setMenuOpen((current) => !current);

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) {
      return;
    }

    setMenuOpen(false);
  };

  const handleLibrarySelected = (libraryKey) => {
    onLibraryChange({ target: { value: libraryKey } });
    setMenuOpen(false);
  };

  return (
    <Tooltip title='.dem file' arrow>
      <ClickAwayListener onClickAway={handleClose}>
        <Box display='flex'>
          <ButtonGroup ref={anchorRef} variant='contained'>
            <Button
              component='label'
              startIcon={<UploadFileIcon />}
              sx={{ width: BUTTON_WIDTH }}
              tabIndex={-1}
            >
              Analyze
              <input
                accept='.dem'
                hidden
                onChange={onFileChange}
                ref={ref}
                type='file'
              />
            </Button>
            <Button
              aria-controls={menuOpen ? 'library-menu' : undefined}
              aria-expanded={menuOpen ? 'true' : undefined}
              aria-haspopup='menu'
              onClick={handleToggle}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                gap: 0.25,
                justifyContent: 'center',
                lineHeight: 1.75,
                minHeight: 36.5,
                px: 1.25,
                width: BUTTON_WIDTH
              }}
            >
              {library.gameLabel}
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>

          <Popper
            anchorEl={anchorRef.current}
            disablePortal
            open={menuOpen}
            placement='bottom-end'
            role={undefined}
            sx={{ zIndex: 1300 }}
            transition
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps}>
                <Paper>
                  <MenuList autoFocusItem id='library-menu'>
                    {LIBRARIES.map((item) => (
                      <MenuItem
                        key={item.key}
                        onClick={() => handleLibrarySelected(item.key)}
                        selected={item.key === library.key}
                      >
                        {item.gameLabel}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Box>
      </ClickAwayListener>
    </Tooltip>
  );
});

export default UploadForm;
