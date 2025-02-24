'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useRouter } from 'next/router';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { isAuthenticated, user, logout } = useAuth();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
        >
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            CV Builder
          </Link>
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <>
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => router.push('/dashboard/create-cv')}
                >
                  CV Oluştur
                </Button>
                <Button
                  color="inherit"
                  startIcon={<WorkIcon />}
                  onClick={() => router.push('/jobs')}
                >
                  İş İlanları
                </Button>
              </>
            )}
            
            <IconButton
              onClick={handleMenu}
              color="inherit"
              edge="end"
            >
              {user?.email ? (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.email[0].toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {isMobile && (
                <>
                  <MenuItem onClick={() => { router.push('/dashboard/create-cv'); handleClose(); }}>
                    <DashboardIcon sx={{ mr: 1 }} /> CV Oluştur
                  </MenuItem>
                  <MenuItem onClick={() => { router.push('/jobs'); handleClose(); }}>
                    <WorkIcon sx={{ mr: 1 }} /> İş İlanları
                  </MenuItem>
                </>
              )}
              <MenuItem onClick={() => { router.push('/profile'); handleClose(); }}>
                <AccountCircleIcon sx={{ mr: 1 }} /> Profilim
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Çıkış Yap
              </MenuItem>
            </Menu>
            <ThemeToggle />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button color="inherit" onClick={() => router.push('/login')}>
              Giriş Yap
            </Button>
            <Button 
              color="inherit" 
              variant="outlined"
              onClick={() => router.push('/register')}
            >
              Kayıt Ol
            </Button>
            <ThemeToggle />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
} 