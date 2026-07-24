import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Box, Divider, Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, AccountTree, Assignment,
  Assessment, History
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function Sidebar({ open, onClose, isMobile, mode = 'dark' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isLight = mode === 'light';

  const menuItems = [
    { text: 'Dashboard',       icon: <DashboardIcon />, path: '/' },
    { text: 'Employees',       icon: <People />,        path: '/employees' },
    { text: 'Projects',        icon: <AccountTree />,   path: '/projects' },
    { text: 'Tasks',           icon: <Assignment />,    path: '/tasks' },
    { text: 'Reports & Export', icon: <Assessment />,  path: '/reports' },
    ...(isAdmin ? [{ text: 'Audit Logs', icon: <History />, path: '/audit-logs' }] : [])
  ];

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', mt: 2 }}>
      {/* Sidebar label */}
      <Typography
        variant="overline"
        sx={{
          display: 'block',
          px: 3,
          mb: 1,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: isLight ? '#94a3b8' : '#475569'
        }}
      >
        Navigation
      </Typography>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleItemClick(item.path)}
                sx={{
                  borderRadius: '10px',
                  py: 1.1,
                  px: 2,
                  transition: 'all 0.15s ease-in-out',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                    '& .MuiListItemIcon-root': { color: '#ffffff' },
                    '& .MuiListItemText-primary': { color: '#ffffff' },
                    '&:hover': { bgcolor: 'primary.dark' }
                  },
                  '&:hover:not(.Mui-selected)': {
                    bgcolor: isLight ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.06)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected
                      ? '#ffffff'
                      : isLight ? '#475569' : '#94a3b8',
                    minWidth: 38,
                    '& .MuiSvgIcon-root': { fontSize: 20 }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    letterSpacing: '-0.01em',
                    color: isSelected
                      ? '#ffffff'
                      : isLight ? '#1e293b' : '#e2e8f0'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ my: 2, opacity: isLight ? 0.5 : 0.15 }} />

      {/* Footer */}
      <Box sx={{ px: 3 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '0.68rem',
            color: isLight ? '#94a3b8' : '#475569',
            lineHeight: 1.6
          }}
        >
          Smart Enterprise v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: isLight
            ? '1px solid #e2e8f0'
            : '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: isLight ? '#ffffff' : undefined
        }
      }}
    >
      <Toolbar />
      {drawerContent}
    </Drawer>
  );
}
