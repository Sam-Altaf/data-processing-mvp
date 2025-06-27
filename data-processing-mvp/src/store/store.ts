import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  FileMetadata, 
  Dataset, 
  TransformationTask, 
  ConversationSession 
} from '../types';

interface AppState {
  files: FileMetadata[];
  datasets: Dataset[];
  tasks: TransformationTask[];
  conversationSessions: ConversationSession[];
  currentSessionId: string | null;
  
  // Files actions
  addFile: (file: Omit<FileMetadata, 'id' | 'created' | 'modified'>) => void;
  updateFileMetadata: (id: string, metadata: Partial<FileMetadata>) => void;
  deleteFile: (id: string) => void;
  
  // Datasets actions
  addDataset: (dataset: Omit<Dataset, 'id' | 'created' | 'modified'>) => void;
  updateDataset: (id: string, dataset: Partial<Dataset>) => void;
  deleteDataset: (id: string) => void;
  
  // Tasks actions
  createTask: (task: Omit<TransformationTask, 'id' | 'status'>) => void;
  updateTaskStatus: (id: string, status: TransformationTask['status'], resultDatasetId?: string) => void;
  
  // Conversation actions
  createConversationSession: (name: string, datasetIds: string[]) => void;
  addMessageToSession: (sessionId: string, sender: 'user' | 'system', content: string, datasetIds?: string[]) => void;
  setCurrentSession: (sessionId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  datasets: [],
  tasks: [],
  conversationSessions: [],
  currentSessionId: null,
  
  // Files actions
  addFile: (file) => 
    set((state) => ({ 
      files: [...state.files, { 
        ...file, 
        id: uuidv4(), 
        created: new Date(), 
        modified: new Date() 
      }] 
    })),
    
  updateFileMetadata: (id, metadata) => 
    set((state) => ({
      files: state.files.map(file => 
        file.id === id ? { ...file, ...metadata, modified: new Date() } : file
      )
    })),
    
  deleteFile: (id) => 
    set((state) => ({
      files: state.files.filter(file => file.id !== id)
    })),
  
  // Datasets actions
  addDataset: (dataset) => 
    set((state) => ({
      datasets: [...state.datasets, { 
        ...dataset, 
        id: uuidv4(), 
        created: new Date(), 
        modified: new Date() 
      }]
    })),
    
  updateDataset: (id, dataset) => 
    set((state) => ({
      datasets: state.datasets.map(ds => 
        ds.id === id ? { ...ds, ...dataset, modified: new Date() } : ds
      )
    })),
    
  deleteDataset: (id) => 
    set((state) => ({
      datasets: state.datasets.filter(ds => ds.id !== id)
    })),
  
  // Tasks actions
  createTask: (task) => 
    set((state) => ({
      tasks: [...state.tasks, { 
        ...task, 
        id: uuidv4(), 
        status: 'pending' 
      }]
    })),
    
  updateTaskStatus: (id, status, resultDatasetId) => 
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, status, resultDatasetId } : task
      )
    })),
  
  // Conversation actions
  createConversationSession: (name, datasetIds) => 
    set((state) => {
      const sessionId = uuidv4();
      return {
        conversationSessions: [...state.conversationSessions, {
          id: sessionId,
          name,
          messages: [],
          activeDatasetIds: datasetIds
        }],
        currentSessionId: sessionId
      };
    }),
    
  addMessageToSession: (sessionId, sender, content, datasetIds) => 
    set((state) => ({
      conversationSessions: state.conversationSessions.map(session => 
        session.id === sessionId ? {
          ...session,
          messages: [...session.messages, {
            id: uuidv4(),
            sender,
            content,
            timestamp: new Date(),
            relatedDatasetIds: datasetIds
          }]
        } : session
      )
    })),
    
  setCurrentSession: (sessionId) => 
    set({ currentSessionId: sessionId }),
}));

// Initialize with demo data for development
if (process.env.NODE_ENV === 'development') {
  // Add some demo files
  const demoFiles = [
    {
      id: 'file-1',
      name: 'Customer Data 2023.xlsx',
      type: 'excel' as FileType,
      definition: 'Annual customer data analysis',
      intelligenceLevel: 'raw' as IntelligenceLevel,
      format: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      created: new Date('2023-12-15'),
      modified: new Date('2023-12-15')
    },
    {
      id: 'file-2',
      name: 'Marketing Report.pdf',
      type: 'pdf' as FileType,
      definition: 'Q4 Marketing Campaign Analysis',
      intelligenceLevel: 'raw' as IntelligenceLevel,
      format: 'application/pdf',
      created: new Date('2023-12-10'),
      modified: new Date('2023-12-10')
    },
    {
      id: 'file-3',
      name: 'Product Inventory.docx',
      type: 'word' as FileType,
      definition: 'Current inventory and product descriptions',
      intelligenceLevel: 'raw' as IntelligenceLevel,
      format: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      created: new Date('2023-12-05'),
      modified: new Date('2023-12-05')
    }
  ];
  
  // Add demo datasets
  const demoDatasets = [
    {
      id: 'dataset-1',
      name: 'Processed Customer Data',
      type: 'json' as FileType,
      definition: 'Cleaned and processed customer analytics data',
      intelligenceLevel: 'processed' as IntelligenceLevel,
      format: 'json',
      sources: ['file-1'],
      transformationLogic: 'Extract customer segments and purchase patterns',
      created: new Date('2023-12-16'),
      modified: new Date('2023-12-16'),
      data: { 
        segments: ['high-value', 'medium-value', 'low-value'],
        customerCount: 1250,
        averagePurchaseValue: 127.5
      }
    },
    {
      id: 'dataset-2',
      name: 'Marketing Insights',
      type: 'csv' as FileType,
      definition: 'Key performance metrics from marketing campaigns',
      intelligenceLevel: 'analyzed' as IntelligenceLevel,
      format: 'text/csv',
      sources: ['file-2'],
      transformationLogic: 'Extract and tabulate campaign metrics',
      created: new Date('2023-12-12'),
      modified: new Date('2023-12-12'),
      data: [
        { campaign: 'Email', clicks: 3450, conversions: 278, revenue: 15640 },
        { campaign: 'Social', clicks: 5230, conversions: 412, revenue: 24780 },
        { campaign: 'Search', clicks: 2180, conversions: 195, revenue: 18650 }
      ]
    }
  ];
  
  // Add demo tasks
  const demoTasks = [
    {
      id: 'task-1',
      name: 'Customer Segmentation',
      description: 'Segment customers by purchase frequency and value',
      sourceDatasetIds: ['dataset-1'],
      outputFormat: 'json' as OutputFormat,
      transformationLogic: 'Group customers by purchase frequency and total spending',
      status: 'completed' as const,
      resultDatasetId: 'dataset-3'
    },
    {
      id: 'task-2',
      name: 'Campaign ROI Analysis',
      description: 'Calculate ROI for each marketing campaign',
      sourceDatasetIds: ['dataset-2'],
      outputFormat: 'chart' as OutputFormat,
      transformationLogic: 'Calculate ROI as (Revenue - Cost) / Cost * 100',
      status: 'pending' as const
    }
  ];
  
  // Add demo conversations
  const demoConversations = [
    {
      id: 'conversation-1',
      name: 'Customer Data Analysis',
      messages: [
        {
          id: 'msg-1',
          sender: 'user' as const,
          content: 'How many high-value customers do we have?',
          timestamp: new Date('2023-12-20T10:30:00'),
          relatedDatasetIds: ['dataset-1']
        },
        {
          id: 'msg-2',
          sender: 'system' as const,
          content: 'Based on the customer data, you have 320 high-value customers, making up 25.6% of your total customer base.',
          timestamp: new Date('2023-12-20T10:30:05'),
          relatedDatasetIds: ['dataset-1']
        }
      ],
      activeDatasetIds: ['dataset-1']
    }
  ];
  
  // Initialize demo data in the store
  useAppStore.setState({
    files: demoFiles,
    datasets: demoDatasets,
    tasks: demoTasks,
    conversationSessions: demoConversations,
    currentSessionId: demoConversations[0].id
  });
}