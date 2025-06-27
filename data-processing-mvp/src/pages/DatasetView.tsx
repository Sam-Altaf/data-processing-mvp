import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Stack,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  DataObject as DataObjectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Dataset as DatasetIcon,
  TableChart as TableIcon,
  Code as CodeIcon,
  BarChart as ChartIcon,
  Lightbulb as InsightIcon,
  History as HistoryIcon,
  Add as AddIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { useSnackbar } from '../components/shared/Snackbar';
import ResultPreview from '../components/ResultViewer/ResultPreview';
import DatasetChain from '../components/DatasetChain/DatasetChain';
import { Dataset as DatasetType, FileType, IntelligenceLevel, OutputFormat } from '../types';

const DatasetView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useSnackbar();
  
  const datasets = useAppStore(state => state.datasets);
  const updateDataset = useAppStore(state => state.updateDataset);
  const deleteDataset = useAppStore(state => state.deleteDataset);
  
  const [dataset, setDataset] = useState<DatasetType | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<DatasetType>>({});
  const [showTaskDrawer, setShowTaskDrawer] = useState(false);
  
  useEffect(() => {
    if (id) {
      const currentDataset = datasets.find(ds => ds.id === id);
      if (currentDataset) {
        setDataset(currentDataset);
        setEditedData({
          name: currentDataset.name,
          definition: currentDataset.definition,
          type: currentDataset.type,
          intelligenceLevel: currentDataset.intelligenceLevel
        });
      } else {
        showError('Dataset not found');
        navigate('/datasets');
      }
    }
  }, [id, datasets, navigate, showError]);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    if (isEditMode) {
      // Save changes
      if (dataset) {
        updateDataset(dataset.id, editedData);
        showSuccess('Dataset updated successfully');
      }
    }
    setIsEditMode(!isEditMode);
    handleMenuClose();
  };
  
  const handleDeleteConfirm = () => {
    if (dataset) {
      deleteDataset(dataset.id);
      showInfo('Dataset deleted');
      navigate('/datasets');
    }
    setShowDeleteDialog(false);
    handleMenuClose();
  };
  
  const handleEditChange = (field: keyof DatasetType, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleDownload = () => {
    if (!dataset) return;
    
    try {
      const dataStr = JSON.stringify(dataset.data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', dataUri);
      downloadLink.setAttribute('download', `${dataset.name}.json`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      showSuccess('Download started');
    } catch (error) {
      showError('Error downloading dataset');
      console.error('Download error:', error);
    }
    handleMenuClose();
  };
  
  const handleCreateTask = () => {
    if (!dataset) return;
    setShowTaskDrawer(true);
    handleMenuClose();
  };
  
  // Determine the output format based on dataset type
  const getOutputFormat = (type: FileType): OutputFormat => {
    switch (type) {
      case 'csv': return 'csv';
      case 'excel': return 'csv';
      case 'json': return 'json';
      default: return 'json';
    }
  };
  
  if (!dataset) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading dataset...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ pb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Breadcrumbs navigation */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link component={RouterLink} to="/" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/datasets" color="inherit">
            Datasets
          </Link>
          <Typography color="text.primary">
            {dataset.name}
          </Typography>
        </Breadcrumbs>
        
        {/* Dataset header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {isEditMode ? (
                <TextField
                  value={editedData.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  variant="standard"
                  fullWidth
                  sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                />
              ) : (
                dataset.name
              )}
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                icon={<DataObjectIcon />}
                label={dataset.type.toUpperCase()} 
                color="primary" 
                size="small"
                variant="outlined"
              />
              <Chip 
                icon={getIntelligenceLevelIcon(dataset.intelligenceLevel)}
                label={dataset.intelligenceLevel} 
                color={getIntelligenceLevelColor(dataset.intelligenceLevel)}
                size="small"
                variant="outlined"
              />
              <Chip 
                icon={<HistoryIcon />}
                label={new Date(dataset.modified).toLocaleDateString()} 
                color="default" 
                size="small"
                variant="outlined"
              />
            </Stack>
          </Box>
          
          <Box>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
              sx={{ mr: 1 }}
            >
              New Task
            </Button>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditToggle}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {isEditMode ? 'Save Changes' : 'Edit Dataset'}
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDownload}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  Download Data
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                setShowDeleteDialog(true);
              }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: 'error.main' }}>
                  Delete Dataset
                </ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Description */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Description
          </Typography>
          {isEditMode ? (
            <TextField
              value={editedData.definition || ''}
              onChange={(e) => handleEditChange('definition', e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="body1" paragraph>
              {dataset.definition}
            </Typography>
          )}
          
          {isEditMode ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editedData.type || ''}
                    label="Type"
                    onChange={(e) => handleEditChange('type', e.target.value)}
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="word">Word</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Intelligence Level</InputLabel>
                  <Select
                    value={editedData.intelligenceLevel || ''}
                    label="Intelligence Level"
                    onChange={(e) => handleEditChange('intelligenceLevel', e.target.value as IntelligenceLevel)}
                  >
                    <MenuItem value="raw">Raw</MenuItem>
                    <MenuItem value="processed">Processed</MenuItem>
                    <MenuItem value="analyzed">Analyzed</MenuItem>
                    <MenuItem value="insight">Insight</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DataObjectIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Format
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {dataset.format}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {dataset.sources && dataset.sources.length > 0 ? (
                    <DatasetIcon color="secondary" sx={{ mr: 1 }} />
                  ) : (
                    <ViewIcon color="info" sx={{ mr: 1 }} />
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {dataset.sources && dataset.sources.length > 0 ? 'Source Datasets' : 'Original Source'}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {dataset.sources ? `${dataset.sources.length} sources` : 'Direct Upload'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon color="default" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(dataset.created).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </Paper>
        
        {/* Tab navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Data Preview" />
            <Tab label="Transformation Chain" />
            <Tab label="Conversations" />
          </Tabs>
        </Box>
        
        {/* Tab content */}
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <ResultPreview 
                data={dataset.data} 
                format={getOutputFormat(dataset.type)}
              />
            </Paper>
          )}
          
          {tabValue === 1 && (
            <Box>
              <DatasetChain 
                datasetId={dataset.id}
                onCreateTask={() => setShowTaskDrawer(true)}
              />
            </Box>
          )}
          
          {tabValue === 2 && (
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Conversations Using This Dataset
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<ChatIcon />}
                  onClick={() => navigate('/conversations/new', { state: { datasetId: dataset.id } })}
                >
                  Start New Conversation
                </Button>
              </Box>
              
              <DatasetConversationsList datasetId={dataset.id} />
            </Paper>
          )}
        </Box>
      </motion.div>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Dataset</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{dataset.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Task creation drawer */}
      {showTaskDrawer && (
        <TaskCreationDrawer
          open={showTaskDrawer}
          onClose={() => setShowTaskDrawer(false)}
          selectedDatasetIds={[dataset.id]}
        />
      )}
    </Box>
  );
};

// Helper functions to get color and icon for intelligence level
const getIntelligenceLevelColor = (level: IntelligenceLevel): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (level) {
    case 'raw': return 'default';
    case 'processed': return 'info';
    case 'analyzed': return 'secondary';
    case 'insight': return 'success';
    default: return 'default';
  }
};

const getIntelligenceLevelIcon = (level: IntelligenceLevel) => {
  switch (level) {
    case 'raw': return <DataObjectIcon />;
    case 'processed': return <TableIcon />;
    case 'analyzed': return <BarChartIcon />;
    case 'insight': return <InsightIcon />;
    default: return <DataObjectIcon />;
  }
};

// Component to display conversations that use this dataset
const DatasetConversationsList: React.FC<{ datasetId: string }> = ({ datasetId }) => {
  const conversationSessions = useAppStore(state => state.conversationSessions);
  const navigate = useNavigate();
  
  // Filter conversations that include this dataset
  const relatedConversations = conversationSessions.filter(
    session => session.activeDatasetIds.includes(datasetId)
  );
  
  if (relatedConversations.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No conversations using this dataset yet.
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ChatIcon />}
          onClick={() => navigate('/conversations/new', { state: { datasetId } })}
          sx={{ mt: 2 }}
        >
          Start a Conversation
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <List>
        {relatedConversations.map(session => (
          <React.Fragment key={session.id}>
            <ListItem 
              button
              onClick={() => navigate(`/conversation/${session.id}`)}
              secondaryAction={
                <IconButton edge="end">
                  <ArrowForwardIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <ChatIcon color="info" />
              </ListItemIcon>
              <ListItemText 
                primary={session.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {session.messages.length} messages • Last activity: {
                        session.messages.length > 0 
                          ? new Date(session.messages[session.messages.length - 1].timestamp).toLocaleString() 
                          : 'Never'
                      }
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default DatasetView;