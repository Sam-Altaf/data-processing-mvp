import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Dataset as DatasetIcon,
  ChatBubbleOutline as ChatIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  AccountCircle as AccountIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/store';
import { useAuthStore } from '../../store/authStore';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
  mobileOpen?: boolean;
}>(({ theme, open, mobileOpen }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
  [theme.breakpoints.up('sm')]: {
    marginLeft: mobileOpen ? 0 : drawerWidth,
    padding: theme.spacing(4),
  },
}));

const MuiAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotifAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/auth');
  };
  
  const menuItems = [
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { name: 'Datasets', icon: <DatasetIcon />, path: '/datasets' },
    { name: 'Conversations', icon: <ChatIcon />, path: '/conversations' },
    { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  const drawer = (
    <>
      <DrawerHeader>
        <Typography variant="h6" sx={{ fontWeight: 700, pl: 1 }}>
          DataProcess MVP
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              selected={
                item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path)
              }
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Data Processing MVP
        </Typography>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <MuiAppBar position="fixed" open={open && !isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {
              location.pathname === '/' ? 'Dashboard' :
              location.pathname.startsWith('/dataset') ? 'Dataset Details' :
              location.pathname.startsWith('/conversation') ? 'Conversation' :
              location.pathname === '/settings' ? 'Settings' : ''
            }
          </Typography>
          
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={3} color="secondary">
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar 
              src={user?.avatar} 
              alt={user?.name} 
              sx={{ width: 32, height: 32 }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </MuiAppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: open ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={isMobile ? mobileOpen : open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              boxSizing: 'border-box',
              boxShadow: 3,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Main open={open && !isMobile} mobileOpen={mobileOpen && isMobile}>
        <DrawerHeader />
        <Outlet />
      </Main>
      
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate('/profile');
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate('/settings');
        }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
      
      <Menu
        id="notifications-menu"
        anchorEl={notifAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <MenuItem>
          <ListItemText 
            primary="New dataset transformation complete" 
            secondary="Customer Analytics - 3 minutes ago"
          />
        </MenuItem>
        <MenuItem>
          <ListItemText 
            primary="AI suggested a new insight" 
            secondary="Sales Data - 10 minutes ago"
          />
        </MenuItem>
        <MenuItem>
          <ListItemText 
            primary="File parsing error detected" 
            secondary="Marketing Report - 25 minutes ago"
          />
        </MenuItem>
        <Divider />
        <MenuItem sx={{ justifyContent: 'center' }}>
          <Typography color="primary" variant="body2">
            See all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;