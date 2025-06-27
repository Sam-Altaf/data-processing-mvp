import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Button, 
  LinearProgress, 
  Chip, 
  Stack,
  Paper,
  Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  FilePresent as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/store';
import { useSnackbar } from '../components/shared/Snackbar';
import { uploadFile } from '../../services/api';
import { FileType, IntelligenceLevel } from '../../types';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/json'
];

const EnhancedFileUploader: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess, showError } = useSnackbar();
  const addFile = useAppStore(state => state.addFile);
  
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [fileErrors, setFileErrors] = useState<{[key: string]: string}>({});
  const [pausedUploads, setPausedUploads] = useState<{[key: string]: boolean}>({});
  const [showUploadCompleteDialog, setShowUploadCompleteDialog] = useState(false);
  const [successfulUploads, setSuccessfulUploads] = useState<string[]>([]);
  
  const getFileType = (file: File): FileType => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'excel';
    if (extension === 'pdf') return 'pdf';
    if (extension === 'json') return 'json';
    return 'other';
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files by size and type
    const validFiles: File[] = [];
    const errors: {[key: string]: string} = {};
    
    acceptedFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        errors[file.name] = `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
      } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors[file.name] = 'File type not supported';
      } else {
        validFiles.push(file);
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFileErrors(prev => ({ ...prev, ...errors }));
    }
    
    if (validFiles.length > 0) {
      setUploadQueue(prev => [...prev, ...validFiles]);
      
      // Initialize progress for new files
      const initialProgress: {[key: string]: number} = {};
      validFiles.forEach(file => {
        initialProgress[file.name] = 0;
      });
      setUploadProgress(prev => ({
        ...prev,
        ...initialProgress
      }));
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: true
  });
  
  const handleStartUpload = async () => {
    if (uploadQueue.length === 0 || uploading) return;
    
    setUploading(true);
    const newSuccessfulUploads: string[] = [];
    
    try {
      for (const file of uploadQueue) {
        // Skip files that are paused
        if (pausedUploads[file.name]) continue;
        
        try {
          // For demo purposes, we'll simulate the API call instead of making a real one
          // In a real application, use the uploadFile service function:
          // await uploadFile('/upload', file, (progress) => {...}, { fileType: getFileType(file) });
          
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          }
          
          // Add file to store after successful upload
          addFile({
            name: file.name,
            type: getFileType(file),
            definition: '',
            intelligenceLevel: 'raw',
            format: file.type,
            data: {} // The actual data would come from the server in a real app
          });
          
          newSuccessfulUploads.push(file.name);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setFileErrors(prev => ({
            ...prev,
            [file.name]: error instanceof Error ? error.message : 'Upload failed'
          }));
        }
      }
      
      // Remove uploaded files from queue
      setUploadQueue(prev => prev.filter(file => !newSuccessfulUploads.includes(file.name)));
      
      // Show success message
      if (newSuccessfulUploads.length > 0) {
        setSuccessfulUploads(newSuccessfulUploads);
        setShowUploadCompleteDialog(true);
        showSuccess(`Successfully uploaded ${newSuccessfulUploads.length} file(s)`);
      }
    } catch (error) {
      showError('An error occurred during the upload process');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveFile = (fileName: string) => {
    setUploadQueue(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
    setPausedUploads(prev => {
      const newPaused = { ...prev };
      delete newPaused[fileName];
      return newPaused;
    });
  };
  
  const handleTogglePause = (fileName: string) => {
    setPausedUploads(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            {...getRootProps()}
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: isDragActive ? 'rgba(63, 81, 181, 0.05)' : 'white',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.400',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <input {...getInputProps()} />
            
            <AnimatePresence>
              {isDragActive ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }} color="primary">
                    Drop files to upload
                  </Typography>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & drop files here, or click to select files
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Supported formats: Word (.doc, .docx), PDF (.pdf), Excel (.xls, .xlsx, .csv), JSON (.json)
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    disabled={uploading}
                    startIcon={<FileUploadIcon />}
                  >
                    Select Files
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </AnimatePresence>
      
      {uploadQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Files Ready for Upload ({uploadQueue.length})
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleStartUpload}
                disabled={uploading || uploadQueue.length === 0}
                startIcon={<CloudUploadIcon />}
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </Box>
            
            <Stack spacing={2}>
              {uploadQueue.map((file) => {
                const progress = uploadProgress[file.name] || 0;
                const error = fileErrors[file.name];
                const isPaused = pausedUploads[file.name];
                
                return (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        backgroundColor: error ? 'rgba(255, 0, 0, 0.05)' : isPaused ? 'rgba(0, 0, 0, 0.02)' : 'white',
                        border: '1px solid',
                        borderColor: error ? 'error.light' : isPaused ? 'grey.300' : 'transparent',
                        opacity: isPaused ? 0.7 : 1
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <FileIcon color={error ? 'error' : 'primary'} />
                        </Grid>
                        <Grid item xs>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileType(file).toUpperCase()}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                color={error ? 'error' : 'primary'}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {progress}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={isPaused ? "Resume" : "Pause"}>
                              <IconButton 
                                size="small"
                                onClick={() => handleTogglePause(file.name)}
                                color={isPaused ? "default" : "primary"}
                              >
                                {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFile(file.name)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {error && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'error.main' }}>
                          <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="error">
                            {error}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </motion.div>
                );
              })}
            </Stack>
          </Paper>
        </motion.div>
      )}
      
      {/* Upload Complete Dialog */}
      <Dialog
        open={showUploadCompleteDialog}
        onClose={() => setShowUploadCompleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'relative', bgcolor: 'success.light', pt: 3, pb: 2 }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white'
            }}
            onClick={() => setShowUploadCompleteDialog(false)}
          >
            <CloseIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          
          <Typography variant="h6" align="center" color="white" sx={{ fontWeight: 600 }}>
            Upload Complete!
          </Typography>
        </Box>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Successfully uploaded {successfulUploads.length} file(s)
          </Typography>
          
          <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
            <List>
              {successfulUploads.map(fileName => (
                <ListItem key={fileName}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={fileName} />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowUploadCompleteDialog(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              setShowUploadCompleteDialog(false);
              // Navigate to metadata editor or next step
            }}
          >
            Edit Metadata
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedFileUploader;