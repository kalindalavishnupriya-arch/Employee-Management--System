import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, IconButton, Box, Chip, Menu, MenuItem, Avatar, Tooltip, Divider, Typography
} from '@mui/material';
import {
  Menu as MenuIcon, Brightness4, Brightness7, AccountCircle, Logout, Security, Settings
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import Logo from './Logo';
import api from '../api/axiosInstance';

export default function Navbar({ onToggleSidebar, mode, onToggleMode }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    if (user?.employeeId) {
      api.get(`/employees/${user.employeeId}`)
        .then((res) => {
          if (res.data && res.data.profileImageUrl) {
            setProfileImageUrl(res.data.profileImageUrl);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(12px)',
        borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.05)',
        bgcolor: mode === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={onToggleSidebar} edge="start" sx={{ mr: 1, color: mode === 'dark' ? '#f8fafc' : '#0f172a' }}>
          <MenuIcon />
        </IconButton>

        {/* Formal Corporate Logo via Logo component */}
        <Box sx={{ flexGrow: 1 }}>
          <Logo mode={mode} size="medium" showSubtitle={true} />
        </Box>

        {/* Right-side controls */}
        <Box display="flex" alignItems="center" gap={0.5}>

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}>
            <IconButton onClick={onToggleMode} size="small" sx={{
              color: mode === 'dark' ? '#94a3b8' : '#475569',
              '&:hover': { color: mode === 'dark' ? '#f8fafc' : '#0f172a', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
            }}>
              {mode === 'dark' ? <Brightness7 sx={{ fontSize: 20 }} /> : <Brightness4 sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <NotificationBell />

          {user && (
            <>
              {/* Role Badge */}
              <Chip
                icon={isAdmin ? <Security sx={{ fontSize: 14 }} /> : undefined}
                label={isAdmin ? 'Admin' : 'Employee'}
                color={isAdmin ? 'primary' : 'default'}
                variant="outlined"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.02em',
                  borderWidth: '1.5px',
                  px: 0.5,
                  height: 26,
                  color: isAdmin ? 'primary.main' : mode === 'dark' ? '#94a3b8' : '#475569',
                  borderColor: isAdmin ? 'primary.main' : mode === 'dark' ? 'rgba(255,255,255,0.25)' : '#cbd5e1',
                  '& .MuiChip-icon': {
                    color: isAdmin ? 'primary.main' : mode === 'dark' ? '#94a3b8' : '#475569'
                  }
                }}
              />

              {/* Avatar / User Menu Trigger */}
              <Tooltip title={`${user.username} — ${isAdmin ? 'Administrator' : 'Employee'}`}>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                  <Avatar
                    src={profileImageUrl}
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      bgcolor: isAdmin ? '#4f46e5' : '#0284c7',
                      color: '#ffffff',
                      border: mode === 'dark' ? '2px solid rgba(255,255,255,0.2)' : '2px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                      border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }
                  }
                }}
              >
                {/* User Info Header */}
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                    {user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {isAdmin ? 'System Administrator' : 'Employee'}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ gap: 1.5, py: 1.2 }}>
                  <AccountCircle sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>My Profile</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }} sx={{ gap: 1.5, py: 1.2 }}>
                  <Settings sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>Settings</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogoutClick} sx={{ gap: 1.5, py: 1.2, color: 'error.main' }}>
                  <Logout sx={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={600}>Sign Out</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
