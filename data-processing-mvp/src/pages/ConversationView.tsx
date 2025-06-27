import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  NavigateNext as NavigateNextIcon,
  Download as DownloadIcon,
  Archive as ArchiveIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { useSnackbar } from '../components/shared/Snackbar';
import EnhancedDataChat from '../components/ConversationInterface/EnhancedDataChat';

const ConversationView: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  
  const conversationSessions = useAppStore(state => state.conversationSessions);
  
  const [session, setSession] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      const currentSession = conversationSessions.find(s => s.id === id);
      if (currentSession) {
        setSession(currentSession);
        setEditedName(currentSession.name);
      } else {
        showError('Conversation not found');
        navigate('/conversations');
      }
    }
  }, [id, conversationSessions, navigate, showError]);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleNameEditStart = () => {
    setIsEditingName(true);
    handleMenuClose();
  };
  
  const handleNameEditSave = () => {
    if (!editedName.trim()) {
      showError('Conversation name cannot be empty');
      return;
    }
    
    // In a real app, this would update the session name in the store
    // For now, we'll just update the local state
    setSession(prev => ({ ...prev, name: editedName }));
    setIsEditingName(false);
    showSuccess('Conversation name updated');
  };
  
  const handleNameEditCancel = () => {
    setEditedName(session?.name || '');
    setIsEditingName(false);
  };
  
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteConfirm = () => {
    // In a real app, this would delete the session from the store
    // For now, we'll just navigate away
    showSuccess('Conversation deleted');
    navigate('/conversations');
    setDeleteDialogOpen(false);
  };
  
  const handleExportConversation = () => {
    if (!session) return;
    
    try {
      const exportData = {
        name: session.name,
        id: session.id,
        messages: session.messages.map((msg: any) => ({
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        exportedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `conversation-${session.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      handleMenuClose();
      showSuccess('Conversation exported successfully');
    } catch (error) {
      showError('Failed to export conversation');
      console.error('Export error:', error);
    }
  };
  
  if (!id || !session) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading conversation...
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
          <Link component={RouterLink} to="/conversations" color="inherit">
            Conversations
          </Link>
          <Typography color="text.primary">
            {session.name}
          </Typography>
        </Breadcrumbs>
        
        {/* Conversation header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            {isEditingName ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  variant="standard"
                  fullWidth
                  autoFocus
                  sx={{ mr: 1 }}
                />
                <IconButton color="primary" onClick={handleNameEditSave} size="small">
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleNameEditCancel} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {session.name}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Started {new Date(session.messages[0]?.timestamp || Date.now()).toLocaleString()} • 
              {session.messages.length} messages
            </Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined"
              startIcon={<ShareIcon />}
              sx={{ mr: 1 }}
            >
              Share
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleNameEditStart}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Rename</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleExportConversation}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export Conversation</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <ArchiveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDeleteDialogOpen}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Chat interface */}
        <EnhancedDataChat sessionId={id} />
      </motion.div>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConversationView;