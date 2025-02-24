import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'next-i18next';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <Tooltip title={t(mode === 'dark' ? 'theme.lightMode' : 'theme.darkMode')}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
} 