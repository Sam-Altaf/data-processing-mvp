import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Grid,
  Badge,
  useTheme,
  List,
  ListItem,
  Drawer,
  Checkbox
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  DataObject as DataObjectIcon,
  Refresh as RefreshIcon,
  AddCircleOutline as AddIcon,
  Close as CloseIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Bar, 
  Line, 
  Pie, 
  Scatter,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'react-chartjs-2';
import Highlight from 'react-highlight';
import 'highlight.js/styles/github.css';
import { useAppStore } from '../../store/store';
import { useSnackbar } from '../shared/Snackbar';
import { ConversationMessage, Dataset } from '../../types';
import useWebSocket from '../../hooks/useWebSocket';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const StyledMessageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  display: 'flex',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(2)
}));

const StyledMessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  maxWidth: '75%',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  position: 'relative'
}));

const StyledDatasetChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
  '& .MuiChip-icon': {
    fontSize: 16,
  },
}));

const MessageTypingIndicator = () => (
  <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1, alignItems: 'center' }}>
    <motion.div 
      animate={{ 
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 0.5, delay: 0 }
      }}
      style={{ width: 8, height: 8, borderRadius: '50%', background: '#3f51b5' }}
    />
    <motion.div 
      animate={{ 
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 0.5, delay: 0.15 }
      }}
      style={{ width: 8, height: 8, borderRadius: '50%', background: '#3f51b5' }}
    />
    <motion.div 
      animate={{ 
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 0.5, delay: 0.3 }
      }}
      style={{ width: 8, height: 8, borderRadius: '50%', background: '#3f51b5' }}
    />
  </Box>
);

interface EnhancedDataChatProps {
  initialDatasetIds?: string[];
  sessionId?: string;
  onCreateSession?: (name: string, datasetIds: string[]) => string;
  fullscreen?: boolean;
}

const EnhancedDataChat: React.FC<EnhancedDataChatProps> = ({ 
  initialDatasetIds = [], 
  sessionId,
  onCreateSession,
  fullscreen = false
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSuccess } = useSnackbar();
  const urlParamSessionId = useParams<{ id: string }>().id;
  
  const currentSessionId = sessionId || urlParamSessionId;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);
  const [showDatasetDrawer, setShowDatasetDrawer] = useState(false);
  const [activeDatasetIds, setActiveDatasetIds] = useState<string[]>(initialDatasetIds);
  
  // Get conversation session and datasets from store
  const conversationSessions = useAppStore(state => state.conversationSessions);
  const datasets = useAppStore(state => state.datasets);
  const addMessageToSession = useAppStore(state => state.addMessageToSession);
  const createConversationSession = useAppStore(state => state.createConversationSession);
  
  const currentSession = currentSessionId 
    ? conversationSessions.find(session => session.id === currentSessionId)
    : null;
  
  const activeDatasets = datasets.filter(ds => activeDatasetIds.includes(ds.id));
  
  // WebSocket integration for realtime conversation
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
    currentSessionId 
      ? `${process.env.REACT_APP_WS_URL || 'ws://localhost:8080'}/chat/${currentSessionId}` 
      : null
  );
  
  // Initialize session if needed
  useEffect(() => {
    if (!currentSessionId && initialDatasetIds.length > 0 && onCreateSession) {
      // Create a new session with the initial datasets
      const defaultName = activeDatasets.length > 0 
        ? `Chat about ${activeDatasets[0].name}${activeDatasets.length > 1 ? ` +${activeDatasets.length - 1}` : ''}`
        : 'New Conversation';
      
      const newSessionId = createConversationSession(defaultName, initialDatasetIds);
      navigate(`/conversation/${newSessionId}`);
    }
  }, [currentSessionId, initialDatasetIds, onCreateSession, createConversationSession, activeDatasets, navigate]);
  
  // Scroll to bottom when messages are added
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isTyping]);
  
  // Process WebSocket messages
  useEffect(() => {
    if (lastMessage && currentSession) {
      try {
        const messageData = JSON.parse(lastMessage);
        
        if (messageData.type === 'message') {
          // Handle normal message
          addMessageToSession(
            currentSession.id,
            'system',
            messageData.content,
            messageData.relatedDatasetIds
          );
          setIsTyping(false);
        } else if (messageData.type === 'typing') {
          // Handle typing indicator
          setIsTyping(messageData.isTyping);
        } else if (messageData.type === 'visualization') {
          // Handle visualization data
          setChartOptions(messageData.visualizationData);
          
          // Also add a message with the visualization
          const visualizationMessage = JSON.stringify({
            type: messageData.visualizationType || 'chart',
            data: messageData.visualizationData,
            title: messageData.title || 'Data Visualization'
          });
          
          addMessageToSession(
            currentSession.id,
            'system',
            visualizationMessage,
            messageData.relatedDatasetIds
          );
          
          setIsTyping(false);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    }
  }, [lastMessage, currentSession, addMessageToSession]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentSession) return;
    
    // Add user message to conversation
    addMessageToSession(currentSession.id, 'user', inputValue, activeDatasetIds);
    
    // Send message via WebSocket
    if (connectionStatus === 'connected') {
      sendMessage(JSON.stringify({
        type: 'message',
        content: inputValue,
        datasetIds: activeDatasetIds
      }));
    } else {
      // For demo purposes - simulate AI response when WebSocket is not connected
      simulateAIResponse(inputValue);
    }
    
    setInputValue('');
    setIsTyping(true);
  };
  
  const simulateAIResponse = (userMessage: string) => {
    // This is just a simple demo response - in a real application, 
    // we would use the WebSocket API to communicate with the backend
    setTimeout(() => {
      if (currentSession) {
        let response = '';
        
        if (userMessage.toLowerCase().includes('show') && userMessage.toLowerCase().includes('table')) {
          // Create a table response
          const tableData = {
            type: 'table',
            data: {
              columns: [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'name', headerName: 'Name', width: 200 },
                { field: 'value', headerName: 'Value', width: 130, type: 'number' },
                { field: 'category', headerName: 'Category', width: 130 },
              ],
              rows: [
                { id: 1, name: 'Item 1', value: 42, category: 'A' },
                { id: 2, name: 'Item 2', value: 28, category: 'B' },
                { id: 3, name: 'Item 3', value: 73, category: 'A' },
                { id: 4, name: 'Item 4', value: 19, category: 'C' },
                { id: 5, name: 'Item 5', value: 55, category: 'B' }
              ]
            }
          };
          response = JSON.stringify(tableData);
        } else if (userMessage.toLowerCase().includes('show') && userMessage.toLowerCase().includes('chart')) {
          // Create a chart response
          const chartData = {
            type: 'chart',
            chartType: 'bar',
            title: 'Sample Data Visualization',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Dataset 1',
                  data: [12, 19, 3, 5, 2, 3],
                  backgroundColor: 'rgba(63, 81, 181, 0.5)',
                },
                {
                  label: 'Dataset 2',
                  data: [5, 15, 10, 8, 12, 9],
                  backgroundColor: 'rgba(245, 0, 87, 0.5)',
                }
              ]
            },
            options: {
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Sample Chart'
                }
              }
            }
          };
          response = JSON.stringify(chartData);
        } else if (userMessage.toLowerCase().includes('code')) {
          // Create a code snippet response
          const codeData = {
            type: 'code',
            language: 'javascript',
            data: `function analyzeData(dataset) {
  const results = {};
  
  // Calculate summary statistics
  results.count = dataset.length;
  results.sum = dataset.reduce((sum, val) => sum + val, 0);
  results.mean = results.sum / results.count;
  
  // Sort data for median calculation
  const sorted = [...dataset].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  results.median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
    
  return results;
}`
          };
          response = JSON.stringify(codeData);
        } else {
          // Regular text response
          response = `Here's an analysis based on the data from ${
            activeDatasets.length > 0 
              ? activeDatasets.map(ds => ds.name).join(' and ') 
              : 'available datasets'
          }: 
          
The key insight is that there's a strong correlation between variables X and Y, with an R² value of 0.87.

Would you like me to show this data as a chart or table?`;
        }
        
        addMessageToSession(
          currentSession.id,
          'system',
          response,
          activeDatasetIds
        );
        setIsTyping(false);
      }
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessageId(null);
  };
  
  const handleCopyMessage = () => {
    if (!selectedMessageId || !currentSession) return;
    
    const message = currentSession.messages.find(msg => msg.id === selectedMessageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
      showSuccess('Message copied to clipboard');
    }
    
    handleMenuClose();
  };
  
  const toggleDatasetSelection = (datasetId: string) => {
    setActiveDatasetIds(prev => 
      prev.includes(datasetId)
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };
  
  // Render different visualization types
  const renderMessageContent = (message: ConversationMessage) => {
    const content = message.content;
    
    // Check if content is a JSON string containing visualization or data
    try {
      const jsonContent = JSON.parse(content);
      
      if (jsonContent.type === 'table') {
        return renderTable(jsonContent.data);
      } else if (jsonContent.type === 'chart') {
        return renderChart(jsonContent);
      } else if (jsonContent.type === 'code') {
        return renderCode(jsonContent.data, jsonContent.language || 'json');
      } else {
        // Fall back to standard text rendering
        return renderText(content);
      }
    } catch (e) {
      // Not JSON, render as regular text
      return renderText(content);
    }
  };
  
  const renderText = (text: string) => (
    <Typography variant="body1">{text}</Typography>
  );
  
  const renderTable = (data: any) => {
    // For DataGrid component
    if (!data || !data.rows || !data.columns) {
      return <Typography color="error">Invalid table data</Typography>;
    }
    
    return (
      <Box sx={{ height: 400, width: '100%', mt: 2, mb: 1 }}>
        <DataGrid
          rows={data.rows}
          columns={data.columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
            },
            boxShadow: 1,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        />
      </Box>
    );
  };
  
  const renderChart = (chartData: any) => {
    const { chartType, data, options, title } = chartData;
    
    // For simple charts, use Chart.js
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>{title}</Typography>
        <Paper sx={{ p: 2, boxShadow: 1, borderRadius: 1 }}>
          {chartType === 'bar' && <Bar data={data} options={options} />}
          {chartType === 'line' && <Line data={data} options={options} />}
          {chartType === 'pie' && <Pie data={data} options={options} />}
          {chartType === 'scatter' && <Scatter data={data} options={options} />}
        </Paper>
      </Box>
    );
  };
  
  const renderCode = (code: string, language: string) => (
    <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
      <Paper sx={{ 
        maxWidth: '100%', 
        overflow: 'auto',
        boxShadow: 1,
        borderRadius: 1,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.100', p: 1 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            {language.toUpperCase()}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => {
              navigator.clipboard.writeText(code);
              showSuccess('Code copied to clipboard');
            }}
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        </Box>
        <Highlight className={language}>
          {code}
        </Highlight>
      </Paper>
    </Box>
  );
  
  // Render associated datasets for a message
  const renderAssociatedDatasets = (datasetIds?: string[]) => {
    if (!datasetIds || datasetIds.length === 0) return null;
    
    const messageDatasets = datasets.filter(ds => datasetIds.includes(ds.id));
    
    if (messageDatasets.length === 0) return null;
    
    return (
      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap' }}>
        {messageDatasets.map(dataset => (
          <StyledDatasetChip
            key={dataset.id}
            icon={<DataObjectIcon fontSize="small" />}
            label={dataset.name}
            size="small"
            variant="outlined"
            color="primary"
          />
        ))}
      </Box>
    );
  };
  
  if (!currentSession && currentSessionId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Conversation not found
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/conversations/new')}
          sx={{ mt: 2 }}
        >
          Start New Conversation
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: fullscreen ? '100vh' : '100%',
      ...(fullscreen && { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, bgcolor: 'background.paper' })
    }}>
      {fullscreen && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{currentSession?.name || 'Data Conversation'}</Typography>
          <IconButton onClick={() => navigate(-1)}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Active datasets section */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2, ...(fullscreen ? { mx: 2, mt: 2 } : {}) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">Active Datasets ({activeDatasetIds.length})</Typography>
          <Button 
            size="small" 
            startIcon={<AddIcon />}
            onClick={() => setShowDatasetDrawer(true)}
          >
            Add Datasets
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {activeDatasets.length > 0 ? (
            activeDatasets.map(dataset => (
              <Chip
                key={dataset.id}
                label={dataset.name}
                size="small"
                color="primary"
                icon={<DataObjectIcon />}
                onDelete={() => toggleDatasetSelection(dataset.id)}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No datasets selected. Add datasets to enable data-specific conversations.
            </Typography>
          )}
        </Box>
      </Paper>
      
      {/* Messages container */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          flexGrow: 1, 
          mb: 2, 
          maxHeight: fullscreen ? 'calc(100vh - 200px)' : 'calc(100vh - 250px)',
          overflowY: 'auto',
          borderRadius: 2,
          bgcolor: theme.palette.background.default,
          ...(fullscreen ? { mx: 2 } : {})
        }}
      >
        <AnimatePresence>
          {connectionStatus === 'connecting' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 100 
              }}
            >
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Connecting to chat server...
              </Typography>
            </motion.div>
          ) : (
            <>
              {currentSession && currentSession.messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ textAlign: 'center', padding: '40px 0' }}
                >
                  <ChatIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Start a conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ask questions about your datasets or request visualizations
                  </Typography>
                  {activeDatasets.length === 0 && (
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => setShowDatasetDrawer(true)}
                      sx={{ mt: 2 }}
                    >
                      Add Datasets
                    </Button>
                  )}
                </motion.div>
              ) : (
                currentSession && currentSession.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <StyledMessageContainer isUser={message.sender === 'user'}>
                      {message.sender !== 'user' && (
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 36,
                            height: 36,
                            mr: 1
                          }}
                        >
                          AI
                        </Avatar>
                      )}
                      
                      <StyledMessageBubble isUser={message.sender === 'user'}>
                        <Box sx={{ 
                          minWidth: '200px',
                          maxWidth: '100%',
                        }}>
                          {renderMessageContent(message)}
                          {renderAssociatedDatasets(message.relatedDatasetIds)}
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 1,
                          pt: 1,
                          borderTop: '1px solid',
                          borderColor: message.sender === 'user' 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.05)',
                        }}>
                          <Typography variant="caption" color={message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Typography>
                          
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleMenuOpen(e, message.id)}
                            sx={{ 
                              color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                              '&:hover': {
                                backgroundColor: message.sender === 'user' 
                                  ? 'rgba(255,255,255,0.1)' 
                                  : 'rgba(0,0,0,0.05)',
                              }
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </StyledMessageBubble>
                      
                      {message.sender === 'user' && (
                        <Avatar
                          sx={{
                            ml: 1,
                            width: 36,
                            height: 36,
                          }}
                        >
                          U
                        </Avatar>
                      )}
                    </StyledMessageContainer>
                  </motion.div>
                ))
              )}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <StyledMessageContainer isUser={false}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 36,
                        height: 36,
                        mr: 1
                      }}
                    >
                      AI
                    </Avatar>
                    <StyledMessageBubble isUser={false} sx={{ py: 1 }}>
                      <MessageTypingIndicator />
                    </StyledMessageBubble>
                  </StyledMessageContainer>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Paper>
      
      {/* Message input */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          boxShadow: 3,
          ...(fullscreen ? { mx: 2, mb: 2 } : {})
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              placeholder="Ask a question about your data..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              disabled={connectionStatus !== 'connected' && !currentSession}
              InputProps={{
                sx: {
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                },
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || (connectionStatus !== 'connected' && !currentSession)}
              sx={{ borderRadius: 3, px: 3 }}
            >
              Send
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
          <Tooltip title="Generate Table">
            <IconButton size="small" color="primary" onClick={() => setInputValue(prev => `${prev} Show data as a table.`)}>
              <TableChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate Chart">
            <IconButton size="small" color="primary" onClick={() => setInputValue(prev => `${prev} Visualize this data as a chart.`)}>
              <BarChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate Code">
            <IconButton size="small" color="primary" onClick={() => setInputValue(prev => `${prev} Generate code to analyze this data.`)}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      
      {/* Message actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCopyMessage}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy message</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle save as dataset
          handleMenuClose();
        }}>
          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save as dataset</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle delete message
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete message</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Dataset selection drawer */}
      <Drawer
        anchor="right"
        open={showDatasetDrawer}
        onClose={() => setShowDatasetDrawer(false)}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 400 },
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Select Datasets</Typography>
          <IconButton onClick={() => setShowDatasetDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {datasets.length > 0 ? (
            datasets.map(dataset => (
              <ListItem 
                key={dataset.id}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={activeDatasetIds.includes(dataset.id)}
                    onChange={() => toggleDatasetSelection(dataset.id)}
                  />
                }
                disablePadding
              >
                <ListItemButton onClick={() => toggleDatasetSelection(dataset.id)}>
                  <ListItemIcon>
                    <DataObjectIcon color={activeDatasetIds.includes(dataset.id) ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={dataset.name}
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {dataset.definition.substring(0, 60)}
                        {dataset.definition.length > 60 ? '...' : ''}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" paragraph>
                No datasets available
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<UploadIcon />}
                onClick={() => navigate('/upload')}
              >
                Upload Data
              </Button>
            </Box>
          )}
        </List>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined"
            onClick={() => setActiveDatasetIds([])}
            disabled={activeDatasetIds.length === 0}
          >
            Clear Selection
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setShowDatasetDrawer(false)}
          >
            Confirm Selection
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default EnhancedDataChat;