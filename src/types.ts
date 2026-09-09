export type LeadPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type LeadSource = 'SAASQUATCH' | 'MANUAL' | 'OTHER';

export interface ScoreCriterionResult {
  id: string;
  criterionName: string;
  targetRule: string;
  pointsAwarded: number;
  maxPoints: number;
  matched: boolean;
  reason: string;
}

export interface ScoringEvaluation {
  leadScore: number;
  priority: LeadPriority;
  scoreReasons: string[];
  detailedCriteria: ScoreCriterionResult[];
}

export interface Lead {
  id: string;
  companyName: string;
  website: string;
  linkedin: string;
  industry: string;
  service: string;
  location: string;
  employeeCount: number;
  revenue: number;
  yearFounded: number;
  ceoName: string;
  ceoAge: number;
  leadScore: number;
  priority: LeadPriority;
  scoreReasons: string[];
  detailedCriteria?: ScoreCriterionResult[];
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  companyName: string;
  website: string;
  linkedin: string;
  industry: string;
  service: string;
  location: string;
  employeeCount: number;
  revenue: number;
  yearFounded: number;
  ceoName: string;
  ceoAge: number;
  source: LeadSource;
}

export interface LeadFilterState {
  search: string;
  priority: 'ALL' | LeadPriority;
  source: 'ALL' | LeadSource;
  industry: string;
  sortBy: 'score_desc' | 'score_asc' | 'name_asc' | 'revenue_desc' | 'created_desc';
}

export interface DashboardStats {
  totalLeads: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  averageScore: number;
  highPercentage: number;
  mediumPercentage: number;
  lowPercentage: number;
  recentLeads: Lead[];
}
