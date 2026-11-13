/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Bot,
  Briefcase,
  Building2,
  FileText,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Menu,
  MessageSquareCode,
  Radar,
  UserCog,
  X,
} from 'lucide-react';
import { AuthView } from './components/auth/AuthView';
import { VerifyEmailView } from './components/auth/VerifyEmailView';
import { AiAssistantModule } from './components/modules/AiAssistantModule';
import { ApplicationsModule } from './components/modules/ApplicationsModule';
import { CompanyPrepModule } from './components/modules/CompanyPrepModule';
import { DashboardModule } from './components/modules/DashboardModule';
import { MockInterviewModule } from './components/modules/MockInterviewModule';
import { ResumeAnalyzerModule } from './components/modules/ResumeAnalyzerModule';
import { RoadmapModule } from './components/modules/RoadmapModule';
import { SkillAnalyzerModule } from './components/modules/SkillAnalyzerModule';
import { StreakLeaderboardModule } from './components/modules/StreakLeaderboardModule';
import { ProfileFormView } from './components/profile/ProfileFormView';
import { auth } from './lib/firebase';
import { logoutStudentAccount } from './services/authService';
import {
  ensureEmptyStudentRecord,
  saveStudentProfileSetup,
  subscribeToActivityLogs,
  subscribeToAiChats,
  subscribeToApplications,
  subscribeToLeaderboard,
  subscribeToMockInterviews,
  subscribeToResumeAnalyses,
  subscribeToStudentProfile,
} from './services/studentService';
import {
  ActivityLog,
  AiChatMessage,
  JobApplication,
  LeaderboardEntry,
  MockInterviewRecord,
  ModuleId,
  ProfileSetupPayload,
  ResumeAnalysis,
  StudentProfile,
} from './types/careerx';

interface NavItem {
  id: ModuleId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Student Dashboard', description: 'Readiness & Activity', icon: LayoutDashboard },
  { id: 'skill-analyzer', label: 'Skill Gap Analyzer', description: 'Diagnostics & Radar', icon: Radar },
  { id: 'roadmap', label: 'Personalized Roadmap', description: '7-Stage Step by Step', icon: MapIcon },
  { id: 'applications', label: 'Application Tracker', description: 'Jobs & Interview Rounds', icon: Briefcase },
  { id: 'ai-assistant', label: 'AI Career Assistant', description: 'Instant Prep Mentor', icon: Bot },
  { id: 'resume-analyzer', label: 'Resume Analyzer', description: 'ATS Diagnostic Engine', icon: FileText },
  { id: 'mock-interview', label: 'Mock Interview Center', description: 'Technical & HR Drills', icon: MessageSquareCode },
  { id: 'company-hub', label: 'Company Preparation', description: 'Company Prep Hub', icon: Building2 },
  { id: 'streak', label: 'Streak & Leaderboard', description: 'XP, Badges & Consistency', icon: Flame },
];

export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [emailVerifiedFlag, setEmailVerifiedFlag] = useState(false);

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumeAnalyses, setResumeAnalyses] = useState<ResumeAnalysis[]>([]);
  const [mockInterviews, setMockInterviews] = useState<MockInterviewRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [aiChats, setAiChats] = useState<AiChatMessage[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const resetWorkspaceState = () => {
    setStudent(null);
    setApplications([]);
    setResumeAnalyses([]);
    setMockInterviews([]);
    setActivityLogs([]);
    setAiChats([]);
    setLeaderboard([]);
    setDataError(null);
    setEditProfileOpen(false);
    setActiveModule('dashboard');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthUser(null);
        setEmailVerifiedFlag(false);
        resetWorkspaceState();
        setAuthReady(true);
        return;
      }

      try {
        await user.reload();
        if (user.emailVerified) {
          await user.getIdToken(true);
        }
      } catch {
        // Keep current user state if offline reload fails temporarily
      }

      setAuthUser(user);
      setEmailVerifiedFlag(user.emailVerified);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser || !emailVerifiedFlag) return;

    let active = true;
    const uid = authUser.uid;
    setProfileLoading(true);
    setDataError(null);

    const unsubscribers: Array<() => void> = [];

    const init = async () => {
      try {
        await ensureEmptyStudentRecord(authUser);
        if (!active) return;

        unsubscribers.push(
          subscribeToStudentProfile(
            uid,
            (profile) => {
              if (!active) return;
              setStudent(profile);
              setProfileLoading(false);
            },
            (err) => {
              if (!active) return;
              setDataError(err.message);
              setProfileLoading(false);
            }
          )
        );

        unsubscribers.push(
          subscribeToApplications(uid, setApplications, (err) => setDataError(err.message))
        );
        unsubscribers.push(
          subscribeToResumeAnalyses(uid, setResumeAnalyses, (err) => setDataError(err.message))
        );
        unsubscribers.push(
          subscribeToMockInterviews(uid, setMockInterviews, (err) => setDataError(err.message))
        );
        unsubscribers.push(
          subscribeToActivityLogs(uid, setActivityLogs, (err) => setDataError(err.message))
        );
        unsubscribers.push(
          subscribeToAiChats(uid, setAiChats, (err) => setDataError(err.message))
        );
        unsubscribers.push(
          subscribeToLeaderboard(setLeaderboard, (err) => console.warn('Leaderboard:', err.message))
        );
      } catch (err) {
        if (!active) return;
        setDataError(err instanceof Error ? err.message : 'Unable to load student workspace.');
        setProfileLoading(false);
      }
    };

    init();

    return () => {
      active = false;
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [authUser, emailVerifiedFlag]);

  const bestAtsScore = useMemo(
    () => resumeAnalyses.reduce((max, r) => Math.max(max, r.atsScore || 0), 0),
    [resumeAnalyses]
  );

  const bestInterviewScore = useMemo(
    () => mockInterviews.reduce((max, m) => Math.max(max, m.score || 0), 0),
    [mockInterviews]
  );

  const handleLogout = async () => {
    await logoutStudentAccount();
    resetWorkspaceState();
  };

  const handleProfileSave = async (payload: ProfileSetupPayload) => {
    if (!student) return;
    await saveStudentProfileSetup(student, payload);
    setEditProfileOpen(false);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto animate-pulse">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-400">Initializing Career-X secure session...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <AuthView />;
  }

  if (!emailVerifiedFlag) {
    return (
      <VerifyEmailView
        email={authUser.email || ''}
        onVerified={async () => {
          if (auth.currentUser) {
            await auth.currentUser.getIdToken(true);
            setEmailVerifiedFlag(true);
          }
        }}
      />
    );
  }

  if (profileLoading || !student) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          {dataError ? (
            <>
              <p className="text-sm font-semibold text-rose-400">Workspace Sync Issue</p>
              <p className="text-xs text-slate-400 break-words">{dataError}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto animate-pulse">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-200">Loading your student workspace...</p>
              <p className="text-xs text-slate-500">Syncing verified Firestore profile & progress</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!student.profileCompleted) {
    return (
      <ProfileFormView
        student={student}
        onSave={handleProfileSave}
        onLogout={handleLogout}
      />
    );
  }

  const currentNav = NAV_ITEMS.find((n) => n.id === activeModule) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900/60 border-r border-slate-800/80">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-none">
              CAREER-X
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Smart Placement Tracker</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                  active
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{item.label}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Student Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs font-semibold text-white truncate">{student.fullName}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{student.email}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
              <span className="text-indigo-400 tabular-nums">{student.xp} XP</span>
              <span className="text-emerald-400 tabular-nums">
                Readiness {student.readinessScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-xs font-medium text-slate-300 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
              <span className="text-base font-bold text-white">CAREER-X</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left ${
                      active
                        ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setEditProfileOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-medium text-rose-300"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb/Title on left, 1 primary action on right */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white truncate">
                {currentNav.label}
              </h1>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                Career-X / {currentNav.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0"
            >
              {student.fullName}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {dataError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {dataError}
            </div>
          )}

          {activeModule === 'dashboard' && (
            <DashboardModule
              student={student}
              applications={applications}
              resumeAnalyses={resumeAnalyses}
              mockInterviews={mockInterviews}
              activityLogs={activityLogs}
              onNavigate={setActiveModule}
              onOpenEditProfile={() => setEditProfileOpen(true)}
            />
          )}

          {activeModule === 'skill-analyzer' && (
            <SkillAnalyzerModule
              student={student}
              bestAtsScore={bestAtsScore}
              bestInterviewScore={bestInterviewScore}
            />
          )}

          {activeModule === 'roadmap' && (
            <RoadmapModule
              student={student}
              bestAtsScore={bestAtsScore}
              bestInterviewScore={bestInterviewScore}
            />
          )}

          {activeModule === 'applications' && (
            <ApplicationsModule student={student} applications={applications} />
          )}

          {activeModule === 'ai-assistant' && (
            <AiAssistantModule
              student={student}
              messages={aiChats}
              applications={applications}
              resumeAnalyses={resumeAnalyses}
              mockInterviews={mockInterviews}
            />
          )}

          {activeModule === 'resume-analyzer' && (
            <ResumeAnalyzerModule
              student={student}
              analyses={resumeAnalyses}
              bestInterviewScore={bestInterviewScore}
            />
          )}

          {activeModule === 'mock-interview' && (
            <MockInterviewModule
              student={student}
              interviews={mockInterviews}
              bestAtsScore={bestAtsScore}
            />
          )}

          {activeModule === 'company-hub' && (
            <CompanyPrepModule
              student={student}
              bestAtsScore={bestAtsScore}
              bestInterviewScore={bestInterviewScore}
            />
          )}

          {activeModule === 'streak' && (
            <StreakLeaderboardModule
              student={student}
              leaderboard={leaderboard}
              bestAtsScore={bestAtsScore}
              bestInterviewScore={bestInterviewScore}
            />
          )}
        </main>
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex items-start justify-center">
          <div className="w-full max-w-3xl my-auto">
            <ProfileFormView
              student={student}
              isEditMode
              onSave={handleProfileSave}
              onCancel={() => setEditProfileOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
