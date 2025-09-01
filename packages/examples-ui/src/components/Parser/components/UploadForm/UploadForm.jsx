import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { forwardRef } from 'react';

const UploadForm = forwardRef(({ onFileChange }, ref) => {
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
          accept='.dem'
          hidden
          onChange={onFileChange}
          ref={ref}
          type='file'
        />
      </Button>
    </Tooltip>
  );
});

export default UploadForm;

