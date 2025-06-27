import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FilePresent as FileIcon,
  Dataset as DatasetIcon,
  Chat as ChatIcon,
  Add as AddIcon,
  BarChart as ChartIcon,
  CloudUpload as UploadIcon,
  DataObject as DataObjectIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { useAppStore } from '../store/store';
import { useAuthStore } from '../store/authStore';
import EnhancedFileUploader from '../components/FileUpload/EnhancedFileUploader';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const files = useAppStore(state => state.files);
  const datasets = useAppStore(state => state.datasets);
  const tasks = useAppStore(state => state.tasks);
  const conversationSessions = useAppStore(state => state.conversationSessions);
  
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Mock data for charts
  const lineChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Files Uploaded',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
      {
        label: 'Datasets Created',
        data: [8, 15, 5, 10, 7, 12],
        fill: false,
        backgroundColor: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
      },
    ],
  };
  
  const barChartData = {
    labels: ['CSV', 'JSON', 'Chart'],
    datasets: [
      {
        label: 'Output Formats',
        data: [15, 12, 8],
        backgroundColor: [
          'rgba(63, 81, 181, 0.6)',
          'rgba(245, 0, 87, 0.6)',
          'rgba(76, 175, 80, 0.6)',
        ],
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  };
  
  return (
    <Box sx={{ pb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.name || 'User'}! Here's an overview of your data processing activities.
          </Typography>
        </Box>
      </motion.div>
      
      <Grid container spacing={3}>
        {/* Stats cards */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StatsCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Files
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {files.length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: 'primary.light',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileIcon fontSize="large" sx={{ color: 'primary.contrastText' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {files.length > 0 ? `${files.length} files uploaded` : 'No files uploaded yet'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={files.length > 0 ? 100 : 0} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </CardContent>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button 
                  size="small" 
                  endIcon={<UploadIcon />}
                  onClick={() => navigate('/upload')}
                >
                  Upload Files
                </Button>
              </Box>
            </StatsCard>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <StatsCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Datasets
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {datasets.length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: 'secondary.light',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DatasetIcon fontSize="large" sx={{ color: 'secondary.contrastText' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {datasets.length > 0 ? `${datasets.filter(d => d.intelligenceLevel === 'processed').length} processed datasets` : 'No datasets created yet'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={datasets.length > 0 ? (datasets.filter(d => d.intelligenceLevel === 'processed').length / datasets.length) * 100 : 0} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color="secondary"
                />
              </CardContent>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button 
                  size="small" 
                  color="secondary"
                  endIcon={<DataObjectIcon />}
                  onClick={() => navigate('/datasets')}
                >
                  View Datasets
                </Button>
              </Box>
            </StatsCard>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <StatsCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Tasks
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {tasks.length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: 'success.light',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ChartIcon fontSize="large" sx={{ color: 'success.contrastText' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {tasks.length > 0 ? `${tasks.filter(t => t.status === 'completed').length} completed tasks` : 'No tasks created yet'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color="success"
                />
              </CardContent>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button 
                  size="small" 
                  color="success"
                  endIcon={<AddIcon />}
                  onClick={() => navigate('/tasks/new')}
                >
                  New Task
                </Button>
              </Box>
            </StatsCard>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <StatsCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Conversations
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {conversationSessions.length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: 'info.light',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ChatIcon fontSize="large" sx={{ color: 'info.contrastText' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {conversationSessions.length > 0 
                    ? `${conversationSessions.reduce((total, session) => total + session.messages.length, 0)} total messages` 
                    : 'No conversations started yet'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={conversationSessions.length > 0 ? 100 : 0} 
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color="info"
                />
              </CardContent>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button 
                  size="small" 
                  color="info"
                  endIcon={<ChatIcon />}
                  onClick={() => navigate('/conversations/new')}
                >
                  New Conversation
                </Button>
              </Box>
            </StatsCard>
          </motion.div>
        </Grid>
        
        {/* Quick upload section */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Quick Upload
              </Typography>
              <EnhancedFileUploader />
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Analytics section */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h6">Analytics Overview</Typography>
              </Box>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="fullWidth"
                  sx={{ mb: 2 }}
                >
                  <Tab label="Activity" />
                  <Tab label="Output Formats" />
                </Tabs>
                
                <Box sx={{ height: 300, p: 2 }}>
                  {activeTab === 0 && (
                    <Line data={lineChartData} options={chartOptions} />
                  )}
                  {activeTab === 1 && (
                    <Bar data={barChartData} options={chartOptions} />
                  )}
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Recent datasets */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Recent Datasets</Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/datasets')}
                >
                  View All
                </Button>
              </Box>
              <Divider />
              
              {datasets.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {datasets.slice(0, 5).map((dataset) => (
                    <React.Fragment key={dataset.id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/dataset/${dataset.id}`)}
                        secondaryAction={
                          <IconButton edge="end">
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <DataObjectIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={dataset.name}
                          secondary={
                            <React.Fragment>
                              <Typography variant="body2" component="span" color="text.secondary">
                                {dataset.definition.substring(0, 60)}
                                {dataset.definition.length > 60 ? '...' : ''}
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Chip 
                                  label={dataset.type.toUpperCase()} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ mr: 0.5 }}
                                />
                                <Chip 
                                  label={dataset.intelligenceLevel} 
                                  size="small" 
                                  color="secondary" 
                                  variant="outlined"
                                />
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No datasets available
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/upload')}
                  >
                    Create Your First Dataset
                  </Button>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Recent conversations */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Recent Conversations</Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/conversations')}
                >
                  View All
                </Button>
              </Box>
              <Divider />
              
              {conversationSessions.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {conversationSessions.slice(0, 5).map((session) => (
                    <React.Fragment key={session.id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/conversation/${session.id}`)}
                        secondaryAction={
                          <IconButton edge="end">
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <ChatIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={session.name}
                          secondary={
                            <React.Fragment>
                              <Typography variant="body2" component="span" color="text.secondary">
                                {session.messages.length > 0 
                                  ? `Last message: ${session.messages[session.messages.length - 1].content.substring(0, 60)}...` 
                                  : 'No messages yet'}
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Chip 
                                  label={`${session.messages.length} messages`} 
                                  size="small" 
                                  color="info" 
                                  variant="outlined"
                                />
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No conversations available
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    startIcon={<ChatIcon />}
                    color="info"
                    onClick={() => navigate('/conversations/new')}
                  >
                    Start Your First Conversation
                  </Button>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;