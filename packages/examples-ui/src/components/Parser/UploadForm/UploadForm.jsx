import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { forwardRef } from 'react';

const UploadForm = forwardRef(({ onChange }, ref) => {
  return (
    <Tooltip title='.dem file' arrow>
      <Button
        component='label'
        variant='contained'
        tabIndex={-1}
        startIcon={<UploadFileIcon />}
      >
        Upload

        <input
          hidden 
          onChange={onChange} 
          ref={ref}
          type='file'
        />
      </Button>
    </Tooltip>
  );
});

export default UploadForm;

