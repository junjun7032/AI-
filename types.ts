
export enum VisualType {
  FLOW = 'FLOW',       // Node and edge diagram (good for Neural Networks, Transformers)
  CHART = 'CHART',     // XY Plot (good for Regression, SVM)
  MATRIX = 'MATRIX',   // Heatmap/Grid (good for Attention maps, Convolution kernels)
}

export interface NodeData {
  id: string;
  label: string;
  type?: 'input' | 'process' | 'output' | 'operation';
  x?: number; // Optional relative position 0-100
  y?: number; // Optional relative position 0-100
  highlight?: boolean;
}

export interface EdgeData {
  from: string;
  to: string;
  label?: string;
  active?: boolean;
}

export interface MatrixCell {
  value: number;
  label?: string;
  highlight?: boolean;
}

export interface ChartPoint {
  x: number;
  y: number;
  group?: string; // e.g., class A vs class B
  highlight?: boolean;
}

export interface VisualizationData {
  type: VisualType;
  nodes?: NodeData[];
  edges?: EdgeData[];
  matrix?: MatrixCell[][];
  chartData?: ChartPoint[];
  chartConfig?: {
    xAxisLabel: string;
    yAxisLabel: string;
    showLine?: boolean; // For regression line
    xDomain?: [number, number]; // [min, max] for consistent animation
    yDomain?: [number, number]; // [min, max] for consistent animation
  };
}

export interface AlgorithmStep {
  stepNumber: number;
  title: string;
  description: string; // Supports Markdown
  keyTerms?: string[]; // Clickable terms to ask AI
  visualData: VisualizationData;
}

export interface AlgorithmExplanation {
  name: string;
  category: string;
  summary: string;
  datasetInfo: {
    name: string;
    description: string;
    fields: string[];      // e.g., ["Square Footage", "Price"]
    sampleCount: string;   // e.g., "10 samples" or "5x5 grid"
    distribution: string;  // e.g., "Linear relationship with 2 outliers"
  };
  useCases: string[];
  steps: AlgorithmStep[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type AlgorithmCategory = '实际应用场景' | '监督学习' | '无监督学习' | '强化学习' | '神经网络' | '深度学习' | 'Transformers';
