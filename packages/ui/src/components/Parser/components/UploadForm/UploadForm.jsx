import { ArrowDropDown as ArrowDropDownIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import { Box, Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Tooltip } from '@mui/material';
import { forwardRef, useRef, useState } from 'react';

import { LIBRARIES } from '../../../../libraries';

const BUTTON_WIDTH = 172;
const BUTTON_HEIGHT = 36;
const SELECT_GAME_LABEL = 'Select a Game';

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
    <Tooltip title={library ? '.dem file' : 'Select a game first'} arrow>
      <ClickAwayListener onClickAway={handleClose}>
        <Box display='flex'>
          <ButtonGroup ref={anchorRef} variant='contained'>
            <Button
              component='label'
              disabled={!library}
              startIcon={<UploadFileIcon />}
              sx={{
                minHeight: BUTTON_HEIGHT,
                width: BUTTON_WIDTH
              }}
              tabIndex={-1}
            >
              Inspect
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
                minHeight: BUTTON_HEIGHT,
                px: 1.5,
                whiteSpace: 'nowrap',
                width: BUTTON_WIDTH
              }}
            >
              <Box component='span' sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {library?.gameLabel ?? SELECT_GAME_LABEL}
              </Box>
              <ArrowDropDownIcon sx={{ flexShrink: 0 }} />
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
                    <MenuItem
                      onClick={() => handleLibrarySelected('')}
                      selected={!library}
                    >
                      {SELECT_GAME_LABEL}
                    </MenuItem>
                    {LIBRARIES.map((item) => (
                      <MenuItem
                        key={item.key}
                        onClick={() => handleLibrarySelected(item.key)}
                        selected={item.key === library?.key}
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
