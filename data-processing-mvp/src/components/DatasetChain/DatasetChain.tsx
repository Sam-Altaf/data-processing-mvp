import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  DataObject as DataObjectIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  BarChart as ChartIcon,
  TableChart as TableIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/store';
import { Dataset, TransformationTask } from '../../types';

interface DatasetChainProps {
  datasetId: string;
  onCreateTask?: () => void;
}

const DatasetChain: React.FC<DatasetChainProps> = ({ datasetId, onCreateTask }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const datasets = useAppStore(state => state.datasets);
  const tasks = useAppStore(state => state.tasks);
  
  const [chain, setChain] = useState<{
    sources: Dataset[];
    current: Dataset | null;
    derived: Array<{
      task: TransformationTask;
      dataset: Dataset | null;
    }>;
  }>({
    sources: [],
    current: null,
    derived: []
  });
  
  // Build the dataset chain when component mounts or datasets/tasks change
  useEffect(() => {
    const currentDataset = datasets.find(ds => ds.id === datasetId);
    if (!currentDataset) return;
    
    // Find source datasets
    const sourcesIds = currentDataset.sources || [];
    const sources = datasets.filter(ds => sourcesIds.includes(ds.id));
    
    // Find tasks that use this dataset as a source
    const relatedTasks = tasks.filter(task => 
      task.sourceDatasetIds.includes(datasetId)
    );
    
    // Find datasets derived from those tasks
    const derived = relatedTasks.map(task => {
      const derivedDataset = task.resultDatasetId 
        ? datasets.find(ds => ds.id === task.resultDatasetId) 
        : null;
        
      return { task, dataset: derivedDataset };
    });
    
    setChain({
      sources,
      current: currentDataset,
      derived
    });
  }, [datasetId, datasets, tasks]);
  
  // Handler for navigating to a dataset
  const navigateToDataset = (id: string) => {
    navigate(`/dataset/${id}`);
  };
  
  if (!chain.current) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Dataset not found
        </Typography>
      </Box>
    );
  }
  
  const getOutputFormatIcon = (format: string) => {
    switch(format) {
      case 'csv': return <TableIcon />;
      case 'chart': return <ChartIcon />;
      case 'json': return <CodeIcon />;
      default: return <DataObjectIcon />;
    }
  };
  
  return (
    <Box>
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Data Transformation Chain
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize the lineage and provenance of this dataset, from its sources to derived outputs
          </Typography>
        </Box>
        
        <Timeline position="alternate" sx={{ 
          p: 0, 
          m: 0,
          [`& .MuiTimelineItem-root:before`]: {
            flex: 0,
            padding: 0
          }
        }}>
          {/* Source datasets */}
          {chain.sources.length > 0 && (
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary" variant="outlined">
                  <DataObjectIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Typography variant="subtitle1" component="span" fontWeight={500}>
                  Source Datasets
                </Typography>
                <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                  <Grid container spacing={2}>
                    {chain.sources.map((source, index) => (
                      <Grid item xs={12} key={source.id}>
                        <Card variant="outlined" sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: theme.shadows[2],
                            transform: 'translateY(-2px)'
                          }
                        }} 
                        onClick={() => navigateToDataset(source.id)}
                        >
                          <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body1" component="div" fontWeight={500}>
                                  {source.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {source.type.toUpperCase()} • {source.intelligenceLevel}
                                </Typography>
                              </Box>
                              <ChevronRightIcon color="action" />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          )}
          
          {/* Current dataset */}
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="secondary">
                <DataObjectIcon />
              </TimelineDot>
              {chain.derived.length > 0 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="subtitle1" component="span" fontWeight={500} color="secondary">
                Current Dataset
              </Typography>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper elevation={2} sx={{ p: 2, mt: 1, border: `2px solid ${theme.palette.secondary.main}` }}>
                  <Typography variant="h6">
                    {chain.current.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {chain.current.definition}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip 
                      icon={<DataObjectIcon />}
                      label={chain.current.type.toUpperCase()} 
                      color="primary" 
                      size="small"
                    />
                    <Chip 
                      icon={<DataObjectIcon />}
                      label={chain.current.intelligenceLevel} 
                      color="secondary" 
                      size="small"
                    />
                  </Stack>
                  
                  {chain.current.transformationLogic && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Transformation Logic:
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {chain.current.transformationLogic}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </TimelineContent>
          </TimelineItem>
          
          {/* Create new derived dataset */}
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="info" variant="outlined">
                <AddIcon />
              </TimelineDot>
              {chain.derived.length > 0 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mt: 1, 
                  border: '1px dashed', 
                  borderColor: 'divider',
                  textAlign: 'center'
                }}
              >
                <Button 
                  variant="outlined" 
                  color="info" 
                  startIcon={<AddIcon />}
                  onClick={onCreateTask}
                  fullWidth
                  sx={{ py: 1 }}
                >
                  Create New Derived Dataset
                </Button>
              </Paper>
            </TimelineContent>
          </TimelineItem>
          
          {/* Derived datasets */}
          {chain.derived.map((item, index) => (
            <TimelineItem key={item.task.id}>
              <TimelineSeparator>
                <TimelineDot color="success">
                  {getOutputFormatIcon(item.task.outputFormat)}
                </TimelineDot>
                {index < chain.derived.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Typography variant="subtitle1" component="span" fontWeight={500}>
                  {item.task.name}
                </Typography>
                <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Transformation Task:
                    </Typography>
                    <Typography variant="body1">
                      {item.task.transformationLogic}
                    </Typography>
                    <Chip 
                      label={`Output: ${item.task.outputFormat.toUpperCase()}`} 
                      size="small"
                      color="primary"
                      variant="outlined"
                      icon={getOutputFormatIcon(item.task.outputFormat)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  
                  {item.dataset ? (
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: theme.shadows[2],
                          transform: 'translateY(-2px)'
                        }
                      }} 
                      onClick={() => navigateToDataset(item.dataset!.id)}
                    >
                      <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" component="div" fontWeight={500}>
                              {item.dataset.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.dataset.type.toUpperCase()} • {item.dataset.intelligenceLevel}
                            </Typography>
                          </Box>
                          <ChevronRightIcon color="action" />
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'background.default',
                      borderRadius: 1
                    }}>
                      <Typography color="text.secondary">
                        Processing... Result dataset not yet available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    </Box>
  );
};

export default DatasetChain;