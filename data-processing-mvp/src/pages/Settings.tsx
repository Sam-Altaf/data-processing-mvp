import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  TextField,
  Button,
  Grid,
  Avatar,
  Switch,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  CloudSync as CloudSyncIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useSnackbar } from '../components/shared/Snackbar';

const Settings: React.FC = () => {
  const theme = useTheme();
  const { showSuccess, showError } = useSnackbar();
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskCompletions: true,
    systemUpdates: false,
    newFeatures: true
  });
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 30,
    syncOnStartup: true
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleUserFormChange = (field: string, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNotificationChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };
  
  const handleSyncSettingChange = (field: string, value: any) => {
    setSyncSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser({
        name: userForm.name,
        email: userForm.email,
        avatar: userForm.avatar
      });
      
      showSuccess('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('Notification preferences saved');
    } catch (error) {
      showError('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveSyncSettings = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('Sync settings saved');
    } catch (error) {
      showError('Failed to save sync settings');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Box sx={{ pb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account, preferences, and application settings
          </Typography>
        </Box>
        
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, pt: 1 }}
          >
            <Tab icon={<PersonIcon />} label="Account" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<CloudSyncIcon />} label="Sync & Storage" />
          </Tabs>
          
          <Divider />
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Account Information</Typography>
                  <Button 
                    startIcon={editing ? <SaveIcon /> : <EditIcon />}
                    variant={editing ? "contained" : "outlined"}
                    onClick={editing ? handleSaveProfile : () => setEditing(true)}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : (editing ? 'Save' : 'Edit')}
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar 
                      src={userForm.avatar}
                      alt={userForm.name}
                      sx={{ width: 120, height: 120, mb: 2 }}
                    />
                    
                    {editing && (
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCameraIcon />}
                        size="small"
                      >
                        Change Photo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                        />
                      </Button>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Name"
                          fullWidth
                          variant="outlined"
                          value={userForm.name}
                          onChange={(e) => handleUserFormChange('name', e.target.value)}
                          disabled={!editing}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Email Address"
                          fullWidth
                          variant="outlined"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => handleUserFormChange('email', e.target.value)}
                          disabled={!editing}
                          required
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" gutterBottom>
                  Connected Accounts
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Google" 
                      secondary="Connected for authentication and data import"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" color="error">
                        Disconnect
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="GitHub" 
                      secondary="Not connected"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small">
                        Connect
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" gutterBottom>
                  Danger Zone
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    borderColor: 'error.main',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Delete Account
                    </Typography>
                    <Typography variant="body2">
                      This will permanently delete your account and all data
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    color="error"
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </Paper>
              </motion.div>
            )}
            
            {activeTab === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Security Settings</Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Password
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Current Password"
                            fullWidth
                            variant="outlined"
                            type="password"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="New Password"
                            fullWidth
                            variant="outlined"
                            type="password"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Confirm New Password"
                            fullWidth
                            variant="outlined"
                            type="password"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="contained">
                            Change Password
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Two-Factor Authentication
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            Two-Factor Authentication is disabled
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                        <Button variant="contained" color="primary">
                          Enable
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Session Management
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Active Sessions
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="Current Session" 
                            secondary={`${navigator.userAgent.split(' ').slice(-2)[0]} • ${new Date().toLocaleString()}`}
                          />
                          <ListItemSecondaryAction>
                            <Button size="small" disabled>
                              Current
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Chrome on Windows" 
                            secondary="Last active: Yesterday at 5:30 PM" 
                          />
                          <ListItemSecondaryAction>
                            <Button size="small" color="error">
                              Revoke
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                      <Button sx={{ mt: 2 }} variant="outlined" color="error">
                        Log Out All Devices
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </motion.div>
            )}
            
            {activeTab === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Notification Preferences</Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveNotifications}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Save Preferences'}
                  </Button>
                </Box>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Email Notifications
                  </Typography>
                  <FormGroup>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={notifications.emailNotifications} 
                          onChange={handleNotificationChange('emailNotifications')}
                        />
                      } 
                      label="Receive notifications via email" 
                    />
                  </FormGroup>
                </Paper>
                
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    System Notifications
                  </Typography>
                  <FormGroup>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={notifications.taskCompletions} 
                          onChange={handleNotificationChange('taskCompletions')}
                        />
                      } 
                      label="Task completions and failures" 
                    />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={notifications.systemUpdates} 
                          onChange={handleNotificationChange('systemUpdates')}
                        />
                      } 
                      label="System updates and maintenance" 
                    />
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={notifications.newFeatures} 
                          onChange={handleNotificationChange('newFeatures')}
                        />
                      } 
                      label="New features and improvements" 
                    />
                  </FormGroup>
                </Paper>
              </motion.div>
            )}
            
            {activeTab === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Sync & Storage Settings</Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveSyncSettings}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Save Settings'}
                  </Button>
                </Box>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sync Configuration
                  </Typography>
                  <FormGroup>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={syncSettings.autoSync} 
                          onChange={(e) => handleSyncSettingChange('autoSync', e.target.checked)}
                        />
                      } 
                      label="Enable automatic sync" 
                    />
                    
                    <Box sx={{ ml: 3, mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
                        Sync interval:
                      </Typography>
                      <FormControl size="small" sx={{ width: 150 }}>
                        <Select
                          value={syncSettings.syncInterval}
                          onChange={(e) => handleSyncSettingChange('syncInterval', e.target.value)}
                          disabled={!syncSettings.autoSync}
                        >
                          <MenuItem value={5}>5 minutes</MenuItem>
                          <MenuItem value={15}>15 minutes</MenuItem>
                          <MenuItem value={30}>30 minutes</MenuItem>
                          <MenuItem value={60}>1 hour</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <FormControlLabel 
                      sx={{ mt: 2 }}
                      control={
                        <Switch 
                          checked={syncSettings.syncOnStartup} 
                          onChange={(e) => handleSyncSettingChange('syncOnStartup', e.target.checked)}
                        />
                      } 
                      label="Sync on application startup" 
                    />
                  </FormGroup>
                </Paper>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Storage Usage
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Used Storage:</Typography>
                      <Typography variant="body2" fontWeight={500}>1.2 GB / 5 GB</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={24} sx={{ height: 8, borderRadius: 1 }} />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" gutterBottom>Storage Breakdown:</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Datasets" secondary="0.8 GB" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Uploaded Files" secondary="0.3 GB" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="System Cache" secondary="0.1 GB" />
                      </ListItem>
                    </List>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mt: 2 }}>
                    <Button variant="outlined" color="primary" sx={{ mr: 1 }}>
                      Clear Cache
                    </Button>
                    <Button variant="outlined" color="primary">
                      Manage Storage
                    </Button>
                  </Box>
                </Paper>
                
                <Alert severity="info">
                  Need more storage? Contact us to upgrade your plan.
                </Alert>
              </motion.div>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Settings;