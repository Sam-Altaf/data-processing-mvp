export type FileType = 'pdf' | 'word' | 'excel' | 'json' | 'csv' | 'other';
export type IntelligenceLevel = 'raw' | 'processed' | 'analyzed' | 'insight';
export type OutputFormat = 'csv' | 'json' | 'chart';

export interface FileMetadata {
  id: string;
  name: string;
  type: FileType;
  definition: string;
  intelligenceLevel: IntelligenceLevel;
  format: string;
  created: Date;
  modified: Date;
}

export interface Dataset extends FileMetadata {
  sources: string[];
  transformationLogic: string;
  data: any;
}

export interface TransformationTask {
  id: string;
  name: string;
  description: string;
  sourceDatasetIds: string[];
  outputFormat: OutputFormat;
  transformationLogic: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultDatasetId?: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: Date;
  relatedDatasetIds?: string[];
}

export interface ConversationSession {
  id: string;
  name: string;
  messages: ConversationMessage[];
  activeDatasetIds: string[];
}