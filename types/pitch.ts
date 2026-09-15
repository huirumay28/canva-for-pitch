export type Role = 'creative' | 'strategy' | 'business';

export type ViewType = 'collage' | 'data' | 'summary';

export type TemplateId = 'visual-collage' | 'data-metrics' | 'executive-summary' | 'full-deck' | 'story-narrative';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string;
  categories: string[];
  defaultView: ViewType;
  defaultInfoBlocks: InfoBlockType[];
}

export type InfoBlockType = 
  | 'brief'
  | 'product'
  | 'client'
  | 'insights'
  | 'deliverables'
  | 'constraints'
  | 'metrics'
  | 'visuals'
  | 'summary';

export interface PitchData {
  id: string;
  title: string;
  brief: string;
  product: {
    name: string;
    description: string;
    category: string;
  };
  client: {
    name: string;
    industry: string;
    background: string;
  };
  insights: {
    trends: string[];
    opportunities: string[];
    challenges: string[];
  };
  deliverables: string[];
  constraints: {
    budget?: string;
    timeline?: string;
    requirements: string[];
  };
  metrics: {
    name: string;
    value: number;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
  visuals: {
    id: string;
    url: string;
    caption: string;
    category: string;
  }[];
  keySummary: {
    objective: string;
    approach: string;
    expectedOutcome: string;
  };
}

export interface RolePreset {
  role: Role;
  label: string;
  defaultView: ViewType;
  color: string;
  icon: string;
  description: string;
}
