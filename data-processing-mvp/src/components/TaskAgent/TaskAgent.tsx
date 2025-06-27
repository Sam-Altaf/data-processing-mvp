import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  useTheme
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  Help as HelpIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as CheckCircleIcon,
   Description as DocumentIcon,
  Storage as DataIcon
} from '@mui/icons-material';


import { TextField } from '@mui/material';
import { FileType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/store';
import { Dataset, TransformationTask, OutputFormat } from '../../types';
import ResultPreview from '../ResultViewer/ResultPreview';
import { useSnackbar } from '../shared/Snackbar';

interface TaskAgentProps {
  selectedDatasetIds: string[];
  onTaskComplete: (resultDatasetId: string) => void;
  onCancel?: () => void;
}

const TaskAgent: React.FC<TaskAgentProps> = ({ 
  selectedDatasetIds, 
  onTaskComplete,
  onCancel
}) => {
  const theme = useTheme();
  const datasets = useAppStore(state => state.datasets);
  const createTask = useAppStore(state => state.createTask);
  const updateTaskStatus = useAppStore(state => state.updateTaskStatus);
  const addDataset = useAppStore(state => state.addDataset);
  const { showSuccess, showError } = useSnackbar();
  
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [task, setTask] = useState<Partial<TransformationTask>>({
    name: '',
    description: '',
    sourceDatasetIds: selectedDatasetIds,
    outputFormat: 'json',
    transformationLogic: ''
  });
  const [suggestedFormats, setSuggestedFormats] = useState<{
    format: OutputFormat;
    reason: string;
    confidence: number;
  }[]>([]);
  const [suggestedLogic, setSuggestedLogic] = useState<{
    logic: string;
    description: string;
  }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  
  // Steps for the task creation process
  const steps = ['Configure Task', 'Define Transformation', 'Preview Results', 'Save Output'];
  
  useEffect(() => {
    // Filter selected datasets
    const selected = datasets.filter(ds => selectedDatasetIds.includes(ds.id));
    setSelectedDatasets(selected);
    
    // Set task source dataset IDs
    setTask(prev => ({
      ...prev,
      sourceDatasetIds: selectedDatasetIds
    }));
    
    // Generate task name if empty
    if (!task.name && selected.length > 0) {
      const taskName = selected.length === 1
        ? `Transform ${selected[0].name}`
        : `Combine and Transform (${selected.length} datasets)`;
        
      setTask(prev => ({
        ...prev,
        name: taskName
      }));
    }
    
    // Generate task suggestions
    if (selected.length > 0) {
      generateSuggestions(selected);
    }
  }, [datasets, selectedDatasetIds, task.name]);
  
  const generateSuggestions = async (selected: Dataset[]) => {
    setLoadingSuggestions(true);
    
    try {
      // In a real application, this would be an API call to an AI service
      // For this MVP, we'll simulate suggestions based on dataset properties
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Generate format suggestions
      const formatSuggestions = getSuggestedFormats(selected);
      setSuggestedFormats(formatSuggestions);
      
      // Set default output format if suggestions available and not already set
      if (formatSuggestions.length > 0 && !task.outputFormat) {
        // Choose the format with highest confidence
        const bestFormat = formatSuggestions.sort((a, b) => b.confidence - a.confidence)[0];
        setTask(prev => ({
          ...prev,
          outputFormat: bestFormat.format
        }));
      }
      
      // Generate transformation logic suggestions
      const logicSuggestions = generateSuggestedTransformationLogic(selected);
      setSuggestedLogic(logicSuggestions);
      
      // Suggest transformation logic if empty
      if (!task.transformationLogic && logicSuggestions.length > 0) {
        setTask(prev => ({
          ...prev,
          transformationLogic: logicSuggestions[0].logic
        }));
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  
  const getSuggestedFormats = (datasets: Dataset[]): {
    format: OutputFormat;
    reason: string;
    confidence: number;
  }[] => {
    const formats: {format: OutputFormat; reason: string; confidence: number}[] = [];
    
    // Check if data might be tabular
    const hasTabularData = datasets.some(ds => 
      Array.isArray(ds.data) || 
      (typeof ds.data === 'object' && ds.data !== null && Object.keys(ds.data).some(key => Array.isArray(ds.data[key])))
    );
    
    // Check if data contains numerical values that might be visualized
    const hasNumericalData = datasets.some(ds => {
      if (Array.isArray(ds.data)) {
        return ds.data.some(item => 
          typeof item === 'object' && 
          Object.values(item).some(val => typeof val === 'number')
        );
      }
      return false;
    });
    
    // Add CSV suggestion for tabular data
    if (hasTabularData) {
      formats.push({
        format: 'csv',
        reason: 'Data appears to be tabular and would be well-suited for CSV format.',
        confidence: 0.85
      });
    }
    
    // Add chart suggestion for numerical data
    if (hasNumericalData) {
      formats.push({
        format: 'chart',
        reason: 'Data contains numerical values that could be effectively visualized in a chart.',
        confidence: hasTabularData ? 0.9 : 0.7
      });
    }
    
    // Add JSON as default option (always available)
    formats.push({
      format: 'json',
      reason: 'JSON provides a flexible format suitable for any data structure.',
      confidence: 0.75
    });
    
    // Sort by confidence
    return formats.sort((a, b) => b.confidence - a.confidence);
  };
  
  const generateSuggestedTransformationLogic = (datasets: Dataset[]): {logic: string; description: string}[] => {
    const suggestions: {logic: string; description: string}[] = [];
    
    if (datasets.length === 0) return suggestions;
    
    // For single dataset transformations
    if (datasets.length === 1) {
      const ds = datasets[0];
      
      // Based on the dataset type
      if (ds.type === 'excel' || ds.type === 'csv') {
        suggestions.push({
          logic: `Extract all data from '${ds.name}' and format as structured table`,
          description: 'Pulls all rows and columns while preserving the tabular structure.'
        });
        
        suggestions.push({
          logic: `Calculate summary statistics from '${ds.name}' including mean, median, and totals`,
          description: 'Analyzes numerical columns to provide statistical insights.'
        });
      } else if (ds.type === 'pdf' || ds.type === 'word') {
        suggestions.push({
          logic: `Extract key information from '${ds.name}' and organize as structured data`,
          description: 'Identifies and extracts important data points from document text.'
        });
        
        suggestions.push({
          logic: `Perform text analysis on '${ds.name}' to identify key topics and sentiment`,
          description: 'Analyzes document content for topic clustering and sentiment assessment.'
        });
      }
    } else {
      // For multiple dataset transformations
      suggestions.push({
        logic: `Combine data from ${datasets.map(ds => `'${ds.name}'`).join(' and ')} into unified dataset`,
        description: 'Merges multiple datasets into a single coherent structure.'
      });
      
      suggestions.push({
        logic: `Join datasets on common fields and aggregate related information`,
        description: 'Identifies common keys between datasets and performs a relational join.'
      });
      
      suggestions.push({
        logic: `Compare and contrast metrics across datasets to identify patterns and outliers`,
        description: 'Analyzes variations in key metrics across different data sources.'
      });
    }
    
    // Always add a generic option
    suggestions.push({
      logic: `Process and transform data into the selected output format`,
      description: 'General-purpose transformation preserving essential data structure.'
    });
    
    return suggestions;
  };
  
  const handleTaskChange = (field: keyof TransformationTask, value: any) => {
    setTask(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleExecuteTask = async () => {
    if (!task.name || !task.transformationLogic || !task.outputFormat) {
      showError('Please provide all required task information.');
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create the task
      createTask({
        name: task.name,
        description: task.description || '',
        sourceDatasetIds: task.sourceDatasetIds || [],
        outputFormat: task.outputFormat as OutputFormat,
        transformationLogic: task.transformationLogic
      });
      
      // Show processing feedback
      showInfo('Processing task...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate mock result based on task
      const mockResult = await generateMockResult(task as Required<TransformationTask>, selectedDatasets);
      setResult(mockResult);
      
      // Move to next step
      handleNext();
      showSuccess('Task executed successfully!');
    } catch (error) {
      console.error('Error executing task:', error);
      showError('Error executing task. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleSaveResult = async () => {
    if (!result || !task.name) return;
    
    try {
      setProcessing(true);
      
      // Create result dataset
      const resultDataset = {
        name: `${task.name} Result`,
        type: task.outputFormat as FileType || 'json',
        definition: `Result of transformation: ${task.transformationLogic}`,
        intelligenceLevel: 'processed',
        format: task.outputFormat as string,
        sources: selectedDatasetIds,
        transformationLogic: task.transformationLogic!,
        data: result
      };
      
      // Add dataset to store
      const newDatasetId = addDataset(resultDataset);
      
      // Update task status to completed
      updateTaskStatus('task-1', 'completed', newDatasetId);
      
      // Show success message
      showSuccess('Result saved successfully!');
      
      // Notify parent component
      onTaskComplete(newDatasetId);
    } catch (error) {
      console.error('Error saving result:', error);
      showError('Error saving result. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  const generateMockResult = async (task: Required<TransformationTask>, datasets: Dataset[]): Promise<any> => {
    // Simulate generating results based on task and datasets
    switch (task.outputFormat) {
      case 'csv':
        return datasets.flatMap(ds => 
          Array.isArray(ds.data) 
            ? ds.data 
            : Array.isArray(ds.data.data) 
              ? ds.data.data 
              : []
        );
      
      case 'json':
        return {
          result: datasets.map(ds => ({
            source: ds.name,
            data: ds.data
          })),
          transformation: task.transformationLogic,
          timestamp: new Date().toISOString()
        };
      
      case 'chart':
        // Generate mock chart data
        return {
          chartType: 'bar',
          labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
          datasets: [
            {
              label: datasets[0]?.name || 'Dataset 1',
              data: [12, 19, 3, 5, 2]
            },
            datasets.length > 1 ? {
              label: datasets[1]?.name || 'Dataset 2',
              data: [3, 10, 13, 15, 22]
            } : null
          ].filter(Boolean)
        };
      
      default:
        return { message: 'Transformation completed', data: null };
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  const showInfo = (message: string) => {
    useSnackbar.getState().showInfo(message);
  };
  
  // Function to render the appropriate step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Configure Task
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Data Sources
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedDatasets.map(dataset => (
                    <Chip 
                      key={dataset.id}
                      label={dataset.name}
                      color="primary"
                      variant="outlined"
                      icon={getDatasetIcon(dataset.type)}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Task Name"
                  fullWidth
                  required
                  value={task.name}
                  onChange={(e) => handleTaskChange('name', e.target.value)}
                  helperText="Give your task a clear, descriptive name"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Output Format</InputLabel>
                  <Select
                    value={task.outputFormat}
                    label="Output Format"
                    onChange={(e) => handleTaskChange('outputFormat', e.target.value)}
                    endAdornment={
                      loadingSuggestions ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null
                    }
                  >
                    {suggestedFormats.map(suggestion => (
                      <MenuItem 
                        key={suggestion.format} 
                        value={suggestion.format}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                          {suggestion.format === 'csv' && <TableIcon sx={{ mr: 1 }} fontSize="small" />}
                          {suggestion.format === 'json' && <CodeIcon sx={{ mr: 1 }} fontSize="small" />}
                          {suggestion.format === 'chart' && <ChartIcon sx={{ mr: 1 }} fontSize="small" />}
                          <Typography fontWeight={500}>{suggestion.format.toUpperCase()}</Typography>
                          {suggestion === suggestedFormats[0] && (
                            <Chip 
                              label="Recommended" 
                              color="primary" 
                              size="small" 
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                          {suggestion.reason}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  value={task.description}
                  onChange={(e) => handleTaskChange('description', e.target.value)}
                  helperText="Provide additional context about this task (optional)"
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1: // Define Transformation
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Transformation Logic
                    <Tooltip title="Define how your data should be processed and transformed">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Button 
                    startIcon={<RefreshIcon />}
                    size="small"
                    onClick={() => generateSuggestions(selectedDatasets)}
                    disabled={loadingSuggestions}
                  >
                    {loadingSuggestions ? 'Generating...' : 'Refresh Suggestions'}
                  </Button>
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={task.transformationLogic}
                  onChange={(e) => handleTaskChange('transformationLogic', e.target.value)}
                  placeholder="Describe the transformation to apply to the data"
                  required
                  sx={{ mb: 2 }}
                />
                
                <Collapse in={showHelp}>
                  <Alert 
                    severity="info" 
                    sx={{ mb: 2 }}
                    action={
                      <IconButton 
                        aria-label="close" 
                        color="inherit" 
                        size="small" 
                        onClick={() => setShowHelp(false)}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2">
                      Describe how you want to transform your data. You can use natural language to define:
                    </Typography>
                    <ul style={{ margin: '4px 0', paddingLeft: '1.5rem' }}>
                      <li>Filtering conditions (e.g., "only include items where price > 100")</li>
                      <li>Aggregations (e.g., "group by category and calculate total sales")</li>
                      <li>Calculations (e.g., "add a new column for profit = price - cost")</li>
                      <li>Formatting (e.g., "format dates as MM/DD/YYYY")</li>
                    </ul>
                  </Alert>
                </Collapse>
                
                <Button 
                  startIcon={<HelpIcon />}
                  size="small"
                  onClick={() => setShowHelp(prev => !prev)}
                  sx={{ mb: 3 }}
                >
                  {showHelp ? 'Hide Help' : 'Show Help'}
                </Button>
                
                <Typography variant="subtitle2" gutterBottom>
                  Suggested Transformations
                </Typography>
                
                {loadingSuggestions ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Generating suggestions...
                    </Typography>
                  </Box>
                ) : suggestedLogic.length > 0 ? (
                  <Grid container spacing={2}>
                    {suggestedLogic.map((suggestion, index) => (
                      <Grid item xs={12} key={index}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'action.hover',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => handleTaskChange('transformationLogic', suggestion.logic)}
                        >
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {suggestion.logic}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {suggestion.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No suggestions available. Please write your own transformation logic.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2: // Preview Results
        return (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Task Result
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {task.transformationLogic}
              </Typography>
            </Box>
            
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Preview" />
                <Tab label="Raw Data" />
              </Tabs>
              
              <Divider />
              
              <Box sx={{ p: 2 }}>
                {processing ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography variant="body1">Processing your task...</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      This may take a few moments depending on the complexity of the transformation.
                    </Typography>
                  </Box>
                ) : (
                  result ? (
                    <>
                      {currentTab === 0 && (
                        <ResultPreview data={result} format={task.outputFormat as OutputFormat} />
                      )}
                      
                      {currentTab === 1 && (
                        <Box component="pre" sx={{ 
                          p: 2, 
                          overflowX: 'auto', 
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          borderRadius: 1
                        }}>
                          {JSON.stringify(result, null, 2)}
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Execute the task to see results
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<RunIcon />}
                        onClick={handleExecuteTask}
                        sx={{ mt: 2 }}
                      >
                        Execute Task
                      </Button>
                    </Box>
                  )
                )}
              </Box>
            </Paper>
          </Box>
        );
      
      case 3: // Save Output
        return (
          <Box>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  bgcolor: 'success.light',
                  color: 'white',
                  py: 3,
                  borderRadius: 2,
                  mb: 3
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 64, mb: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  Task Completed Successfully!
                </Typography>
              </Box>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Save Result
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Result Dataset Name"
                      fullWidth
                      value={`${task.name} Result`}
                      onChange={(e) => {/* Handle name change */}}
                      helperText="Name that will be used for the new dataset"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Intelligence Level</InputLabel>
                      <Select
                        value="processed"
                        label="Intelligence Level"
                      >
                        <MenuItem value="raw">Raw</MenuItem>
                        <MenuItem value="processed">Processed</MenuItem>
                        <MenuItem value="analyzed">Analyzed</MenuItem>
                        <MenuItem value="insight">Insight</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Format"
                      fullWidth
                      value={task.outputFormat}
                      disabled
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Definition"
                      fullWidth
                      multiline
                      rows={2}
                      value={`Result of transformation: ${task.transformationLogic}`}
                      onChange={(e) => {/* Handle definition change */}}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  const getDatasetIcon = (type: string) => {
    switch (type) {
      case 'excel':
      case 'csv':
        return <TableIcon />;
      case 'pdf':
      case 'word':
        return <DocumentIcon />;
      case 'json':
        return <CodeIcon />;
      default:
        return <DataIcon />;
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={1} sx={{ p: 3 }}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Box>
                {activeStep !== 0 && (
                  <Button 
                    onClick={handleBack} 
                    disabled={processing}
                  >
                    Back
                  </Button>
                )}
                
                {activeStep === 0 && (
                  <Button 
                    onClick={onCancel}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveResult}
                    disabled={processing}
                    startIcon={<SaveIcon />}
                  >
                    Save Dataset
                  </Button>
                ) : activeStep === 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExecuteTask}
                    disabled={processing || !task.name || !task.transformationLogic}
                    startIcon={<RunIcon />}
                  >
                    {processing ? <CircularProgress size={24} /> : 'Execute Task'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={activeStep === 0 && (!task.name || !task.outputFormat)}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default TaskAgent;