import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/store';
import { useSnackbar } from '../components/shared/Snackbar';
import { FileMetadata, FileType, IntelligenceLevel } from '../../types';

interface MetadataEditorProps {
  fileIds: string[];
  onComplete: () => void;
  onBack?: () => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({ fileIds, onComplete, onBack }) => {
  const files = useAppStore(state => state.files);
  const updateFileMetadata = useAppStore(state => state.updateFileMetadata);
  const { showSuccess } = useSnackbar();
  
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);
  const [editMode, setEditMode] = useState<'individual' | 'bulk'>('individual');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Bulk edit state
  const [bulkValues, setBulkValues] = useState<{
    type: FileType | '';
    definition: string;
    intelligenceLevel: IntelligenceLevel | '';
  }>({
    type: '',
    definition: '',
    intelligenceLevel: ''
  });
  
  // Apply fields checkboxes for bulk edit
  const [applyFields, setApplyFields] = useState({
    type: false,
    definition: false,
    intelligenceLevel: false
  });
  
  useEffect(() => {
    // Filter the selected files based on fileIds
    const selected = files.filter(file => fileIds.includes(file.id));
    setSelectedFiles(selected);
  }, [files, fileIds]);
  
  const validateField = (field: string, value: any): string => {
    if (field === 'name' && (!value || value.trim() === '')) {
      return 'Name is required';
    }
    if (field === 'definition' && value.length > 500) {
      return 'Definition cannot exceed 500 characters';
    }
    return '';
  };
  
  const handleIndividualChange = (field: keyof FileMetadata, value: any) => {
    const currentFile = selectedFiles[currentFileIndex];
    if (!currentFile) return;
    
    // Validate the field
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    updateFileMetadata(currentFile.id, { [field]: value });
  };
  
  const handleBulkChange = (field: keyof typeof bulkValues, value: any) => {
    // Validate the field for bulk edits
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    setBulkValues(prev => ({ ...prev, [field]: value }));
  };
  
  const handleApplyFieldChange = (field: keyof typeof applyFields) => {
    setApplyFields(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleBulkApply = () => {
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    selectedFiles.forEach(file => {
      const updates: Partial<FileMetadata> = {};
      
      if (applyFields.type && bulkValues.type) {
        updates.type = bulkValues.type;
      }
      
      if (applyFields.definition && bulkValues.definition) {
        updates.definition = bulkValues.definition;
      }
      
      if (applyFields.intelligenceLevel && bulkValues.intelligenceLevel) {
        updates.intelligenceLevel = bulkValues.intelligenceLevel;
      }
      
      if (Object.keys(updates).length > 0) {
        updateFileMetadata(file.id, updates);
      }
    });
    
    showSuccess('Metadata updated for all selected files');
    setBulkEditOpen(false);
  };
  
  const handleNext = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    } else if (onBack) {
      onBack();
    }
  };
  
  const handleSaveAll = () => {
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    showSuccess('Metadata saved successfully');
    onComplete();
  };
  
  if (selectedFiles.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No files selected</Typography>
        {onBack && (
          <Button 
            variant="outlined" 
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        )}
      </Box>
    );
  }
  
  const currentFile = selectedFiles[currentFileIndex];
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          File Metadata {editMode === 'individual' ? `(${currentFileIndex + 1}/${selectedFiles.length})` : `(${selectedFiles.length} files)`}
        </Typography>
        <Box>
          <Button 
            variant="outlined"
            onClick={() => setBulkEditOpen(true)}
            sx={{ mr: 1 }}
            startIcon={<EditIcon />}
          >
            Bulk Edit
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveAll}
            startIcon={<SaveIcon />}
            disabled={Object.keys(validationErrors).length > 0}
          >
            Save All
          </Button>
        </Box>
      </Box>
      
      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Please fix the validation errors to continue
        </Alert>
      )}
      
      {editMode === 'individual' && currentFile && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={`File ${currentFileIndex + 1} of ${selectedFiles.length}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={currentFile.type.toUpperCase()} 
                    color="secondary"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="subtitle2" color="text.secondary">
                  Last modified: {new Date(currentFile.modified).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="File Name"
                    fullWidth
                    value={currentFile.name}
                    onChange={(e) => handleIndividualChange('name', e.target.value)}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || ''}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>File Type</InputLabel>
                    <Select
                      value={currentFile.type}
                      label="File Type"
                      onChange={(e) => handleIndividualChange('type', e.target.value)}
                    >
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="word">Word</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Intelligence Level</InputLabel>
                    <Select
                      value={currentFile.intelligenceLevel}
                      label="Intelligence Level"
                      onChange={(e) => handleIndividualChange('intelligenceLevel', e.target.value as IntelligenceLevel)}
                    >
                      <MenuItem value="raw">Raw</MenuItem>
                      <MenuItem value="processed">Processed</MenuItem>
                      <MenuItem value="analyzed">Analyzed</MenuItem>
                      <MenuItem value="insight">Insight</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Definition"
                    fullWidth
                    multiline
                    rows={3}
                    value={currentFile.definition}
                    onChange={(e) => handleIndividualChange('definition', e.target.value)}
                    placeholder="Enter a description or definition for this file"
                    error={!!validationErrors.definition}
                    helperText={validationErrors.definition || `${currentFile.definition.length}/500 characters`}
                  />
                </Grid>
              </Grid>
            </CardContent>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
              <Button 
                onClick={handlePrev}
                disabled={currentFileIndex === 0 && !onBack}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
              >
                {currentFileIndex === 0 ? 'Back' : 'Previous'}
              </Button>
              <Button 
                onClick={handleNext}
                variant="contained"
                endIcon={currentFileIndex < selectedFiles.length - 1 ? <ArrowForwardIcon /> : <CheckIcon />}
                disabled={Object.keys(validationErrors).length > 0}
              >
                {currentFileIndex < selectedFiles.length - 1 ? 'Next' : 'Complete'}
              </Button>
            </Box>
          </Card>
        </motion.div>
      )}
      
      {/* Bulk Edit Dialog */}
      <Dialog
        open={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Edit Metadata</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changes will be applied to all {selectedFiles.length} selected files.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applyFields.type}
                      onChange={() => handleApplyFieldChange('type')}
                    />
                  }
                  label="Apply File Type"
                  sx={{ mr: 2 }}
                />
                <FormControl fullWidth disabled={!applyFields.type}>
                  <InputLabel>File Type</InputLabel>
                  <Select
                    value={bulkValues.type}
                    label="File Type"
                    onChange={(e) => handleBulkChange('type', e.target.value)}
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="word">Word</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applyFields.intelligenceLevel}
                      onChange={() => handleApplyFieldChange('intelligenceLevel')}
                    />
                  }
                  label="Apply Intelligence Level"
                  sx={{ mr: 2 }}
                />
                <FormControl fullWidth disabled={!applyFields.intelligenceLevel}>
                  <InputLabel>Intelligence Level</InputLabel>
                  <Select
                    value={bulkValues.intelligenceLevel}
                    label="Intelligence Level"
                    onChange={(e) => handleBulkChange('intelligenceLevel', e.target.value as IntelligenceLevel)}
                  >
                    <MenuItem value="raw">Raw</MenuItem>
                    <MenuItem value="processed">Processed</MenuItem>
                    <MenuItem value="analyzed">Analyzed</MenuItem>
                    <MenuItem value="insight">Insight</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applyFields.definition}
                      onChange={() => handleApplyFieldChange('definition')}
                    />
                  }
                  label="Apply Definition"
                  sx={{ mr: 2 }}
                />
                <TextField
                  label="Definition"
                  fullWidth
                  multiline
                  rows={3}
                  value={bulkValues.definition}
                  onChange={(e) => handleBulkChange('definition', e.target.value)}
                  placeholder="Enter a common definition for selected files"
                  disabled={!applyFields.definition}
                  error={!!validationErrors.definition}
                  helperText={validationErrors.definition || `${bulkValues.definition.length}/500 characters`}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEditOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkApply} 
            variant="contained" 
            color="primary"
            disabled={
              Object.keys(validationErrors).length > 0 ||
              (!applyFields.type && !applyFields.definition && !applyFields.intelligenceLevel)
            }
          >
            Apply to All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MetadataEditor;