import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';

interface CustomTemplateCardProps {
  template: {
    id: string;
    name: string;
    created_at?: string;
  };
  isSelected: boolean;
  onSelect: (template: any) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  isDownloading: boolean;
  t: (key: string, defaultValue?: string) => string;
}

const CustomTemplateCard: React.FC<CustomTemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onDelete,
  onDownload,
  isDownloading,
  t
}) => {
  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 2,
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
      onClick={() => onSelect(template)}
    >
      <CardContent>
        <Typography variant="h6">
          {template.name}
        </Typography>
        {template.created_at && (
          <Typography variant="body2" color="text.secondary">
            {new Date(template.created_at).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
        >
          {t('common.delete', 'Sil')}
        </Button>
        <Button
          size="small"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(template.id);
          }}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            t('common.download', 'İndir')
          )}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CustomTemplateCard; 