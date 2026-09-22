export type Role = 'TRAINER' | 'POD_LEAD' | 'POD_MEMBER';

export type SubmissionStatus =
  | 'PENDING_ANALYSIS'
  | 'NEEDS_REVISION'
  | 'PENDING_TRAINER_REVIEW'
  | 'REVIEWED';

export type DecisionStatus = 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
export type OverlapLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  podName?: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Evaluation {
  alignmentScore: number;
  matchedCriteria: string;
  missingCriteria: string;
  overlapLevel: OverlapLevel;
  overlapFlag: boolean;
  analysisSummary: string;
  evaluatedAt: string;
}

export interface Decision {
  status: DecisionStatus;
  comments?: string | null;
  trainerName: string;
  decidedAt: string;
}

export interface Submission {
  id: number;
  podName: string;
  podLeadName: string;
  projectTitle: string;
  problemStatement: string;
  objectives: string;
  technologyStack: string;
  documentationLink?: string | null;
  status: SubmissionStatus;
  submittedAt: string;
  evaluation?: Evaluation | null;
  decision?: Decision | null;
}

export interface TrainerDashboard {
  totalSubmissions: number;
  awaitingReview: number;
  needsRevision: number;
  averageAlignment: number;
  overlapFlags: number;
  reviewQueue: Submission[];
}

export interface PodLeadDashboard {
  mySubmissions: number;
  needsRevision: number;
  pendingReview: number;
  reviewed: number;
  latestScore: number;
  latestStatus: string;
  recentSubmissions: Submission[];
}

export interface Criteria {
  id: number;
  theme: string;
  learningObjectives: string;
  evaluationCriteria: string;
  active: boolean;
}

export interface NotificationItem {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SubmissionRequest {
  projectTitle: string;
  problemStatement: string;
  objectives: string;
  technologyStack: string;
  documentationLink: string;
}

export interface DecisionRequest {
  status: DecisionStatus;
  comments: string;
}
