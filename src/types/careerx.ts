export type ModuleId =
  | 'dashboard'
  | 'skill-analyzer'
  | 'roadmap'
  | 'applications'
  | 'ai-assistant'
  | 'resume-analyzer'
  | 'mock-interview'
  | 'company-hub'
  | 'streak';

export type SkillLevel = '' | 'Beginner' | 'Intermediate' | 'Advanced';

export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'OA / Assessment'
  | 'Technical Interview'
  | 'HR Round'
  | 'Offer'
  | 'Rejected';

export type InterviewType =
  | 'DSA & Coding'
  | 'Core CS & System Design'
  | 'Behavioral & HR'
  | 'Full-Stack Role';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type ActivityCategory =
  | 'Roadmap'
  | 'Coding'
  | 'Application'
  | 'Resume'
  | 'Interview'
  | 'Skill'
  | 'Streak';

export type SkillKey =
  | 'dsa'
  | 'systemDesign'
  | 'coreCs'
  | 'development'
  | 'aptitude'
  | 'communication';

export interface StudentProfile {
  uid: string;
  email: string;
  fullName: string;
  college: string;
  degree: string;
  branch: string;
  academicYear: string;
  cgpa: number;
  targetPackage: string;
  preferredRole: string;
  languages: string[];
  skillLevel: SkillLevel;
  profileCompleted: boolean;
  readinessScore: number;
  questionsSolved: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  badges: string[];
  completedRoadmapTaskIds: string[];
  solvedQuestionIds: string[];
  skillAssessments: Record<string, number>;
  skillGapSummary: string;
  activityDates: string[];
  showOnLeaderboard: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProfileSetupPayload {
  fullName: string;
  college: string;
  degree: string;
  branch: string;
  academicYear: string;
  cgpa: number;
  targetPackage: string;
  preferredRole: string;
  languages: string[];
  skillLevel: SkillLevel;
  showOnLeaderboard: boolean;
}

export interface JobApplication {
  id: string;
  uid: string;
  company: string;
  role: string;
  packageLpa: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ResumeAnalysis {
  id: string;
  uid: string;
  fileName: string;
  targetRole: string;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
  createdAt?: unknown;
}

export interface MockInterviewRecord {
  id: string;
  uid: string;
  interviewType: InterviewType;
  topic: string;
  difficulty: DifficultyLevel;
  score: number;
  questionsCount: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  createdAt?: unknown;
}

export interface ActivityLog {
  id: string;
  uid: string;
  action: string;
  category: ActivityCategory;
  xpEarned: number;
  date: string;
  createdAt?: unknown;
}

export interface AiChatMessage {
  id: string;
  uid: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: unknown;
}

export interface LeaderboardEntry {
  id: string;
  uid: string;
  displayName: string;
  college: string;
  preferredRole: string;
  xp: number;
  currentStreak: number;
  questionsSolved: number;
  readinessScore: number;
  isPublic: boolean;
  updatedAt?: unknown;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: Array<{
      providerId?: string | null;
      email?: string | null;
    }>;
  };
}
