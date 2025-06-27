import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  TableChart as TableIcon,
  BarChart as ChartIcon,
  Code as CodeIcon,
  FileDownload as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
import { OutputFormat } from '../../types';
import { useSnackbar } from '../shared/Snackbar';

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

interface ResultPreviewProps {
  data: any;
  format: OutputFormat;
  title?: string;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ data, format, title }) => {
  const theme = useTheme();
  const { showSuccess, showError } = useSnackbar();
  
  const [viewMode, setViewMode] = useState<string>(format);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleViewModeChange = (event: React.SyntheticEvent, newValue: string) => {
    setViewMode(newValue);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const element = document.getElementById('result-preview-container');
      if (element) {
        element.requestFullscreen().catch(err => {
          showError(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const handleDownload = () => {
    try {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', dataUri);
      downloadLink.setAttribute('download', `data-export.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      showSuccess('Download started');
    } catch (error) {
      showError('Error downloading data');
      console.error('Download error:', error);
    }
  };
  
  const renderTableView = () => {
    // If data is an array of objects
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        );
      }
      
      // Create columns from the first object's keys
      const firstRow = data[0];
      const columns: GridColDef[] = Object.keys(firstRow).map(key => ({
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        flex: 1,
        minWidth: 150,
        type: typeof firstRow[key] === 'number' ? 'number' : 'string',
      }));
      
      // Add id if not present
      const rows = data.map((row, index) => ({
        id: row.id || index,
        ...row
      }));
      
      return (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            checkboxSelection={false}
            disableRowSelectionOnClick
          />
        </Box>
      );
    } 
    
    // For nested data structures, attempt to flatten
    if (typeof data === 'object' && data !== null) {
      // Look for arrays inside the object
      const arraysInData = Object.entries(data).find(([_, value]) => Array.isArray(value));
      
      if (arraysInData) {
        const [arrayName, arrayData] = arraysInData;
        
        // Create columns from the first object's keys if it's an array of objects
        if (Array.isArray(arrayData) && arrayData.length > 0 && typeof arrayData[0] === 'object') {
          const firstRow = arrayData[0];
          const columns: GridColDef[] = Object.keys(firstRow).map(key => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            flex: 1,
            minWidth: 150,
            type: typeof firstRow[key] === 'number' ? 'number' : 'string',
          }));
          
          // Add id if not present
          const rows = arrayData.map((row: any, index: number) => ({
            id: row.id || index,
            ...row
          }));
          
          return (
            <Box sx={{ height: 400, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {arrayName}
              </Typography>
              <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                checkboxSelection={false}
                disableRowSelectionOnClick
              />
            </Box>
          );
        }
      }
    }
    
    // Fallback
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Cannot render this data as a table. Try using the JSON view.
        </Typography>
      </Box>
    );
  };
  
  const renderChartView = () => {
    // Detect if data contains chart data
    if (data && data.chartType && data.data) {
      return renderChartFromData(data);
    }
    
    // If data is an array of objects, try to render a bar or line chart
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No data available to visualize</Typography>
          </Box>
        );
      }
      
      // Find numeric properties for the chart
      const firstRow = data[0];
      const numericProperties = Object.keys(firstRow).filter(
        key => typeof firstRow[key] === 'number'
      );
      
      const labelProperty = Object.keys(firstRow).find(
        key => typeof firstRow[key] === 'string'
      ) || 'index';
      
      if (numericProperties.length > 0) {
        // Create a bar chart with the first numeric property
        const chartData = {
          labels: data.map((item, index) => item[labelProperty] || `Item ${index + 1}`),
          datasets: numericProperties.map((prop, index) => ({
            label: prop,
            data: data.map(item => item[prop]),
            backgroundColor: `rgba(${index * 50 + 50}, ${Math.abs(255 - index * 70)}, ${index * 20 + 100}, 0.6)`,
            borderColor: `rgba(${index * 50 + 50}, ${Math.abs(255 - index * 70)}, ${index * 20 + 100}, 1)`,
            borderWidth: 1
          }))
        };
        
        return (
          <Box sx={{ height: 400, width: '100%' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Data Visualization'
                  }
                }
              }}
            />
          </Box>
        );
      }
    }
    
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Unable to visualize this data. Try providing data with numeric values.
        </Typography>
      </Box>
    );
  };
  
  const renderChartFromData = (chartData: any) => {
    const { chartType, data, options, title: chartTitle } = chartData;
    
    return (
      <Box sx={{ height: 400, width: '100%' }}>
        {chartTitle && (
          <Typography variant="h6" gutterBottom align="center">
            {chartTitle}
          </Typography>
        )}
        
        {chartType === 'bar' && <Bar data={data} options={options || { responsive: true, maintainAspectRatio: false }} />}
        {chartType === 'line' && <Line data={data} options={options || { responsive: true, maintainAspectRatio: false }} />}
        {chartType === 'pie' && <Pie data={data} options={options || { responsive: true, maintainAspectRatio: false }} />}
        {chartType === 'scatter' && <Scatter data={data} options={options || { responsive: true, maintainAspectRatio: false }} />}
      </Box>
    );
  };
  
  const renderJsonView = () => {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    
    return (
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Highlight className="json">
          {jsonString}
        </Highlight>
      </Box>
    );
  };
  
  return (
    <Box id="result-preview-container" sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title || 'Result Preview'}</Typography>
        
        <Box>
          <Tooltip title="Download Data">
            <IconButton onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 1 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          variant="fullWidth"
        >
          <Tab icon={<TableIcon />} label="Table" value="csv" />
          <Tab icon={<ChartIcon />} label="Chart" value="chart" />
          <Tab icon={<CodeIcon />} label="JSON" value="json" />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          {viewMode === 'csv' && renderTableView()}
          {viewMode === 'chart' && renderChartView()}
          {viewMode === 'json' && renderJsonView()}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResultPreview;