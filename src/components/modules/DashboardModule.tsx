import React from 'react';
import {
  ArrowUpRight,
  Award,
  Briefcase,
  CheckCircle2,
  Code2,
  Flame,
  Map as MapIcon,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BADGE_DEFINITIONS, SKILL_DIMENSIONS, TOTAL_ROADMAP_TASKS } from '../../data/curriculum';
import {
  ActivityLog,
  JobApplication,
  MockInterviewRecord,
  ModuleId,
  ResumeAnalysis,
  StudentProfile,
} from '../../types/careerx';

interface DashboardModuleProps {
  student: StudentProfile;
  applications: JobApplication[];
  resumeAnalyses: ResumeAnalysis[];
  mockInterviews: MockInterviewRecord[];
  activityLogs: ActivityLog[];
  onNavigate: (module: ModuleId) => void;
  onOpenEditProfile: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  student,
  applications,
  resumeAnalyses,
  mockInterviews,
  activityLogs,
  onNavigate,
  onOpenEditProfile,
}) => {
  const completedTasks = student.completedRoadmapTaskIds.length;
  const roadmapPct = Math.round((completedTasks / TOTAL_ROADMAP_TASKS) * 100);
  const activeApps = applications.filter((a) => a.status !== 'Rejected').length;
  const offersCount = applications.filter((a) => a.status === 'Offer').length;
  const bestAts = resumeAnalyses.reduce((max, r) => Math.max(max, r.atsScore || 0), 0);
  const bestInterview = mockInterviews.reduce((max, m) => Math.max(max, m.score || 0), 0);

  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (student.readinessScore / 100) * ringCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Welcome & Student Academic Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-indigo-400">Personalized Student Workspace</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {student.fullName}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-slate-400">
            <span>{student.college || 'College not set'}</span>
            <span aria-hidden="true">·</span>
            <span>
              {student.degree} {student.branch ? `(${student.branch})` : ''}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-slate-300 font-medium">
              CGPA {student.cgpa ? student.cgpa.toFixed(2) : '0.00'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">
              Target: {student.targetPackage || 'Not set'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Role: {student.preferredRole || 'Not set'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => onNavigate('roadmap')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Continue Roadmap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Placement Readiness */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Placement Readiness</p>
            <p className="text-3xl font-bold text-white mt-1 tabular-nums">
              {student.readinessScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              {student.readinessScore === 0
                ? 'Start a roadmap task or skill test'
                : student.readinessScore >= 75
                ? 'Interview-ready trajectory'
                : 'Building steady momentum'}
            </p>
          </div>
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
              <circle
                cx="56"
                cy="56"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-800"
              />
              <circle
                cx="56"
                cy="56"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="text-indigo-500 transition-all duration-500"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-indigo-300 tabular-nums">
              {student.readinessScore}%
            </span>
          </div>
        </div>

        {/* Roadmap Progress */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Roadmap Tasks</p>
            <MapIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-white tabular-nums">
              {completedTasks}
              <span className="text-sm font-normal text-slate-500">/{TOTAL_ROADMAP_TASKS}</span>
            </p>
            <div className="mt-3 w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${roadmapPct}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 tabular-nums">{roadmapPct}% roadmap completed</p>
        </div>

        {/* Questions Solved */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Questions Solved</p>
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-white tabular-nums">{student.questionsSolved}</p>
            <p className="text-xs text-slate-400 mt-1">
              {student.questionsSolved === 0
                ? 'Solve company prep drills to earn XP'
                : 'Company & DSA problems solved'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('company-hub')}
            className="mt-3 text-xs font-medium text-cyan-400 hover:text-cyan-300 text-left flex items-center gap-1"
          >
            <span>Practice Company Questions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Streak & XP / Pipeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Streak & Pipeline</p>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-4">
            <div>
              <p className="text-3xl font-bold text-white tabular-nums">
                {student.currentStreak}
                <span className="text-xs font-normal text-slate-400 ml-1">days</span>
              </p>
              <p className="text-xs text-amber-400 font-mono tabular-nums mt-0.5">
                {student.xp} XP · {student.badges.length} badges
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span className="tabular-nums">Applications: {applications.length}</span>
            <span className="tabular-nums">Active: {activeApps}</span>
            <span className="text-emerald-400 tabular-nums">Offers: {offersCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Skill Breakdown + Quick Launchers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Readiness Breakdown */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Placement Readiness Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live domain proficiency vs {student.preferredRole || 'SDE'} benchmark
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('skill-analyzer')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Assess Skills</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKILL_DIMENSIONS.map((dim) => {
              const score = student.skillAssessments?.[dim.key] ?? 0;
              return (
                <div
                  key={dim.key}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{dim.label}</span>
                    <span className="font-mono text-slate-300 tabular-nums">
                      {score}% / {dim.benchmark}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        score >= dim.benchmark
                          ? 'bg-emerald-500'
                          : score > 0
                          ? 'bg-indigo-500'
                          : 'bg-slate-800'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostics & Interview Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onNavigate('resume-analyzer')}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/70 border border-slate-800 text-left transition-colors"
            >
              <p className="text-xs text-slate-400">Best ATS Resume Score</p>
              <p className="text-lg font-bold text-white tabular-nums mt-1">
                {bestAts > 0 ? `${bestAts}/100` : 'Not analyzed'}
              </p>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('mock-interview')}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/70 border border-slate-800 text-left transition-colors"
            >
              <p className="text-xs text-slate-400">Best Mock Interview</p>
              <p className="text-lg font-bold text-white tabular-nums mt-1">
                {bestInterview > 0 ? `${bestInterview}/100` : `${mockInterviews.length} completed`}
              </p>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ai-assistant')}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/70 border border-slate-800 text-left transition-colors"
            >
              <p className="text-xs text-slate-400">AI Career Mentor</p>
              <p className="text-sm font-semibold text-indigo-400 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask for Study Plan</span>
              </p>
            </button>
          </div>
        </div>

        {/* Recent Learning Activity & Badges */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent Activity</h3>
              <button
                type="button"
                onClick={() => onNavigate('streak')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                View Streak
              </button>
            </div>

            {activityLogs.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2">
                <TrendingUp className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-300">No activity recorded yet</p>
                <p className="text-xs text-slate-500">
                  Complete a roadmap task, solve a coding problem, or log an application to start building your timeline.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {activityLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {log.category} · {log.date}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 shrink-0 tabular-nums">
                      +{log.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unlocked Badges */}
          <div className="border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Earned Badges</span>
              </span>
              <span className="text-xs text-slate-500 tabular-nums">
                {student.badges.length}/{BADGE_DEFINITIONS.length}
              </span>
            </div>
            {student.badges.length === 0 ? (
              <p className="text-xs text-slate-500">
                No badges unlocked yet. Complete milestones to earn your first badge.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {BADGE_DEFINITIONS.filter((b) => student.badges.includes(b.id)).map((badge) => (
                  <span
                    key={badge.id}
                    className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{badge.title}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('applications')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Application Tracker</p>
              <p className="text-xs text-slate-400">Track jobs & interview rounds</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('resume-analyzer')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">ATS Resume Analyzer</p>
              <p className="text-xs text-slate-400">Diagnose resume keyword fit</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('mock-interview')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Mock Interview Center</p>
              <p className="text-xs text-slate-400">AI-graded technical & HR drills</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </motion.div>
  );
};
