import { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { TOTAL_ROADMAP_TASKS } from '../data/curriculum';
import { auth, db } from '../lib/firebase';
import {
  ActivityCategory,
  ActivityLog,
  AiChatMessage,
  ApplicationStatus,
  DifficultyLevel,
  FirestoreErrorInfo,
  InterviewType,
  JobApplication,
  LeaderboardEntry,
  MockInterviewRecord,
  OperationType,
  ProfileSetupPayload,
  ResumeAnalysis,
  StudentProfile,
} from '../types/careerx';

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeUpdatedStreak(student: StudentProfile): {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activityDates: string[];
} {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const existingDates = Array.isArray(student.activityDates) ? student.activityDates : [];
  const updatedDates = existingDates.includes(today)
    ? existingDates
    : [...existingDates, today].slice(-365);

  let nextStreak = student.currentStreak || 0;
  if (student.lastActiveDate === today) {
    nextStreak = Math.max(1, nextStreak);
  } else if (student.lastActiveDate === yesterday) {
    nextStreak = nextStreak + 1;
  } else {
    nextStreak = 1;
  }

  const longestStreak = Math.max(student.longestStreak || 0, nextStreak);
  return {
    currentStreak: nextStreak,
    longestStreak,
    lastActiveDate: today,
    activityDates: updatedDates,
  };
}

export function calculateReadinessScore(params: {
  completedRoadmapCount: number;
  skillAssessments: Record<string, number>;
  questionsSolved: number;
  bestAtsScore?: number;
  bestInterviewScore?: number;
  currentStreak: number;
}): number {
  const roadmapPts = Math.min(30, (params.completedRoadmapCount / TOTAL_ROADMAP_TASKS) * 30);

  const skillValues = Object.values(params.skillAssessments || {});
  const avgSkill =
    skillValues.length > 0 ? skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length : 0;
  const skillPts = Math.min(25, (avgSkill / 100) * 25);

  const codingPts = Math.min(20, (params.questionsSolved / 25) * 20);
  const atsPts = Math.min(10, ((params.bestAtsScore || 0) / 100) * 10);
  const interviewPts = Math.min(10, ((params.bestInterviewScore || 0) / 100) * 10);
  const streakPts = Math.min(5, (params.currentStreak / 7) * 5);

  const total = roadmapPts + skillPts + codingPts + atsPts + interviewPts + streakPts;
  return Math.max(0, Math.min(100, Math.round(total)));
}

export function evaluateBadges(params: {
  currentBadges: string[];
  profileCompleted: boolean;
  roadmapCount: number;
  questionsSolved: number;
  currentStreak: number;
  bestAtsScore?: number;
  bestInterviewScore?: number;
}): string[] {
  const set = new Set(params.currentBadges || []);
  if (params.profileCompleted) set.add('b-profile-ready');
  if (params.roadmapCount >= 1) set.add('b-first-step');
  if (params.roadmapCount >= 5) set.add('b-roadmap-5');
  if (params.questionsSolved >= 10) set.add('b-solver-10');
  if (params.currentStreak >= 7) set.add('b-streak-7');
  if ((params.bestAtsScore || 0) >= 75) set.add('b-resume-ready');
  if ((params.bestInterviewScore || 0) >= 75) set.add('b-interview-ace');
  return Array.from(set).slice(0, 30);
}

export async function ensureEmptyStudentRecord(user: User): Promise<StudentProfile> {
  const path = `students/${user.uid}`;
  const ref = doc(db, 'students', user.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as StudentProfile;
    }

    const initialProfile: StudentProfile = {
      uid: user.uid,
      email: (user.email || 'student@careerx.app').slice(0, 200),
      fullName: (user.displayName || user.email?.split('@')[0] || 'Student').slice(0, 120),
      college: '',
      degree: '',
      branch: '',
      academicYear: '',
      cgpa: 0,
      targetPackage: '',
      preferredRole: '',
      languages: [],
      skillLevel: '',
      profileCompleted: false,
      readinessScore: 0,
      questionsSolved: 0,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      badges: [],
      completedRoadmapTaskIds: [],
      solvedQuestionIds: [],
      skillAssessments: {
        dsa: 0,
        systemDesign: 0,
        coreCs: 0,
        development: 0,
        aptitude: 0,
        communication: 0,
      },
      skillGapSummary: '',
      activityDates: [],
      showOnLeaderboard: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, initialProfile);
    return initialProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToStudentProfile(
  uid: string,
  onData: (profile: StudentProfile | null) => void,
  onError: (err: Error) => void
) {
  const path = `students/${uid}`;
  return onSnapshot(
    doc(db, 'students', uid),
    (snapshot) => {
      onData(snapshot.exists() ? (snapshot.data() as StudentProfile) : null);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function syncLeaderboardEntry(student: StudentProfile): Promise<void> {
  const path = `leaderboard/${student.uid}`;
  const ref = doc(db, 'leaderboard', student.uid);
  try {
    await setDoc(ref, {
      uid: student.uid,
      displayName: student.fullName.slice(0, 120),
      college: (student.college || '').slice(0, 180),
      preferredRole: (student.preferredRole || '').slice(0, 120),
      xp: student.xp,
      currentStreak: student.currentStreak,
      questionsSolved: student.questionsSolved,
      readinessScore: student.readinessScore,
      isPublic: Boolean(student.showOnLeaderboard && student.profileCompleted),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStudentProfileSetup(
  current: StudentProfile,
  payload: ProfileSetupPayload
): Promise<void> {
  const path = `students/${current.uid}`;
  const ref = doc(db, 'students', current.uid);
  const nextBadges = evaluateBadges({
    currentBadges: current.badges,
    profileCompleted: true,
    roadmapCount: current.completedRoadmapTaskIds.length,
    questionsSolved: current.questionsSolved,
    currentStreak: current.currentStreak,
  });

  const cleanLanguages = payload.languages.map((l) => l.trim()).filter(Boolean).slice(0, 15);

  const updates = {
    fullName: payload.fullName.trim().slice(0, 120),
    college: payload.college.trim().slice(0, 180),
    degree: payload.degree.trim().slice(0, 100),
    branch: payload.branch.trim().slice(0, 120),
    academicYear: payload.academicYear.trim().slice(0, 60),
    cgpa: Math.max(0, Math.min(10, Number(payload.cgpa) || 0)),
    targetPackage: payload.targetPackage.trim().slice(0, 60),
    preferredRole: payload.preferredRole.trim().slice(0, 120),
    languages: cleanLanguages,
    skillLevel: payload.skillLevel,
    profileCompleted: true,
    showOnLeaderboard: payload.showOnLeaderboard,
    badges: nextBadges,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(ref, updates);
    await syncLeaderboardEntry({
      ...current,
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function logLearningActivity(
  uid: string,
  action: string,
  category: ActivityCategory,
  xpEarned: number
): Promise<void> {
  const path = `students/${uid}/activityLogs`;
  try {
    await addDoc(collection(db, 'students', uid, 'activityLogs'), {
      uid,
      action: action.slice(0, 200),
      category,
      xpEarned: Math.max(0, Math.min(1000, xpEarned)),
      date: getTodayDateString(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleRoadmapTaskProgress(
  student: StudentProfile,
  taskId: string,
  taskTitle: string,
  bestAtsScore: number,
  bestInterviewScore: number
): Promise<boolean> {
  const path = `students/${student.uid}`;
  const ref = doc(db, 'students', student.uid);
  const currentlyCompleted = student.completedRoadmapTaskIds.includes(taskId);

  const nextTaskIds = currentlyCompleted
    ? student.completedRoadmapTaskIds.filter((id) => id !== taskId)
    : [...student.completedRoadmapTaskIds, taskId].slice(0, 100);

  const xpDelta = currentlyCompleted ? -50 : 50;
  const nextXp = Math.max(0, (student.xp || 0) + xpDelta);
  const streakInfo = currentlyCompleted
    ? {
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        lastActiveDate: student.lastActiveDate,
        activityDates: student.activityDates,
      }
    : computeUpdatedStreak(student);

  const nextReadiness = calculateReadinessScore({
    completedRoadmapCount: nextTaskIds.length,
    skillAssessments: student.skillAssessments,
    questionsSolved: student.questionsSolved,
    bestAtsScore,
    bestInterviewScore,
    currentStreak: streakInfo.currentStreak,
  });

  const nextBadges = evaluateBadges({
    currentBadges: student.badges,
    profileCompleted: student.profileCompleted,
    roadmapCount: nextTaskIds.length,
    questionsSolved: student.questionsSolved,
    currentStreak: streakInfo.currentStreak,
    bestAtsScore,
    bestInterviewScore,
  });

  try {
    await updateDoc(ref, {
      completedRoadmapTaskIds: nextTaskIds,
      xp: nextXp,
      readinessScore: nextReadiness,
      badges: nextBadges,
      ...streakInfo,
      updatedAt: serverTimestamp(),
    });

    if (!currentlyCompleted) {
      await logLearningActivity(student.uid, `Completed roadmap task: ${taskTitle}`, 'Roadmap', 50);
    }

    await syncLeaderboardEntry({
      ...student,
      xp: nextXp,
      readinessScore: nextReadiness,
      currentStreak: streakInfo.currentStreak,
    });

    return !currentlyCompleted;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleCompanyQuestionSolved(
  student: StudentProfile,
  questionId: string,
  questionTitle: string,
  bestAtsScore: number,
  bestInterviewScore: number
): Promise<boolean> {
  const path = `students/${student.uid}`;
  const ref = doc(db, 'students', student.uid);
  const alreadySolved = student.solvedQuestionIds.includes(questionId);

  const nextSolvedIds = alreadySolved
    ? student.solvedQuestionIds.filter((id) => id !== questionId)
    : [...student.solvedQuestionIds, questionId].slice(0, 500);

  const nextQuestionsSolved = nextSolvedIds.length;
  const xpDelta = alreadySolved ? -30 : 30;
  const nextXp = Math.max(0, (student.xp || 0) + xpDelta);
  const streakInfo = alreadySolved
    ? {
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        lastActiveDate: student.lastActiveDate,
        activityDates: student.activityDates,
      }
    : computeUpdatedStreak(student);

  const nextReadiness = calculateReadinessScore({
    completedRoadmapCount: student.completedRoadmapTaskIds.length,
    skillAssessments: student.skillAssessments,
    questionsSolved: nextQuestionsSolved,
    bestAtsScore,
    bestInterviewScore,
    currentStreak: streakInfo.currentStreak,
  });

  const nextBadges = evaluateBadges({
    currentBadges: student.badges,
    profileCompleted: student.profileCompleted,
    roadmapCount: student.completedRoadmapTaskIds.length,
    questionsSolved: nextQuestionsSolved,
    currentStreak: streakInfo.currentStreak,
    bestAtsScore,
    bestInterviewScore,
  });

  try {
    await updateDoc(ref, {
      solvedQuestionIds: nextSolvedIds,
      questionsSolved: nextQuestionsSolved,
      xp: nextXp,
      readinessScore: nextReadiness,
      badges: nextBadges,
      ...streakInfo,
      updatedAt: serverTimestamp(),
    });

    if (!alreadySolved) {
      await logLearningActivity(student.uid, `Solved problem: ${questionTitle}`, 'Coding', 30);
    }

    await syncLeaderboardEntry({
      ...student,
      questionsSolved: nextQuestionsSolved,
      xp: nextXp,
      readinessScore: nextReadiness,
      currentStreak: streakInfo.currentStreak,
    });

    return !alreadySolved;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveSkillAssessmentProgress(
  student: StudentProfile,
  assessments: Record<string, number>,
  summary: string,
  bestAtsScore: number,
  bestInterviewScore: number
): Promise<void> {
  const path = `students/${student.uid}`;
  const ref = doc(db, 'students', student.uid);
  const streakInfo = computeUpdatedStreak(student);
  const nextXp = (student.xp || 0) + 40;

  const nextReadiness = calculateReadinessScore({
    completedRoadmapCount: student.completedRoadmapTaskIds.length,
    skillAssessments: assessments,
    questionsSolved: student.questionsSolved,
    bestAtsScore,
    bestInterviewScore,
    currentStreak: streakInfo.currentStreak,
  });

  try {
    await updateDoc(ref, {
      skillAssessments: assessments,
      skillGapSummary: summary.slice(0, 2000),
      xp: nextXp,
      readinessScore: nextReadiness,
      ...streakInfo,
      updatedAt: serverTimestamp(),
    });

    await logLearningActivity(student.uid, 'Completed skill gap self-assessment & AI diagnostic', 'Skill', 40);
    await syncLeaderboardEntry({
      ...student,
      xp: nextXp,
      readinessScore: nextReadiness,
      currentStreak: streakInfo.currentStreak,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function recordDailyStreakCheckIn(
  student: StudentProfile,
  bestAtsScore: number,
  bestInterviewScore: number
): Promise<{ alreadyCheckedIn: boolean }> {
  const today = getTodayDateString();
  if (student.lastActiveDate === today) {
    return { alreadyCheckedIn: true };
  }

  const path = `students/${student.uid}`;
  const ref = doc(db, 'students', student.uid);
  const streakInfo = computeUpdatedStreak(student);
  const nextXp = (student.xp || 0) + 25;
  const nextReadiness = calculateReadinessScore({
    completedRoadmapCount: student.completedRoadmapTaskIds.length,
    skillAssessments: student.skillAssessments,
    questionsSolved: student.questionsSolved,
    bestAtsScore,
    bestInterviewScore,
    currentStreak: streakInfo.currentStreak,
  });
  const nextBadges = evaluateBadges({
    currentBadges: student.badges,
    profileCompleted: student.profileCompleted,
    roadmapCount: student.completedRoadmapTaskIds.length,
    questionsSolved: student.questionsSolved,
    currentStreak: streakInfo.currentStreak,
    bestAtsScore,
    bestInterviewScore,
  });

  try {
    await updateDoc(ref, {
      ...streakInfo,
      xp: nextXp,
      readinessScore: nextReadiness,
      badges: nextBadges,
      updatedAt: serverTimestamp(),
    });
    await logLearningActivity(student.uid, 'Daily preparation streak check-in', 'Streak', 25);
    await syncLeaderboardEntry({
      ...student,
      xp: nextXp,
      readinessScore: nextReadiness,
      currentStreak: streakInfo.currentStreak,
    });
    return { alreadyCheckedIn: false };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Subcollection Listeners & Mutations ---

export function subscribeToApplications(
  uid: string,
  onData: (items: JobApplication[]) => void,
  onError: (err: Error) => void
) {
  const path = `students/${uid}/applications`;
  const q = query(
    collection(db, 'students', uid, 'applications'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobApplication, 'id'>) })));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function createJobApplication(
  student: StudentProfile,
  input: {
    company: string;
    role: string;
    packageLpa: string;
    location: string;
    status: ApplicationStatus;
    appliedDate: string;
    notes: string;
  }
): Promise<void> {
  const path = `students/${student.uid}/applications`;
  try {
    await addDoc(collection(db, 'students', student.uid, 'applications'), {
      uid: student.uid,
      company: input.company.trim().slice(0, 120),
      role: input.role.trim().slice(0, 120),
      packageLpa: input.packageLpa.trim().slice(0, 40),
      location: input.location.trim().slice(0, 100),
      status: input.status,
      appliedDate: input.appliedDate.slice(0, 20),
      notes: input.notes.trim().slice(0, 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await logLearningActivity(
      student.uid,
      `Added application: ${input.company} (${input.role})`,
      'Application',
      15
    );
    await updateDoc(doc(db, 'students', student.uid), {
      xp: (student.xp || 0) + 15,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateJobApplication(
  uid: string,
  applicationId: string,
  input: {
    company: string;
    role: string;
    packageLpa: string;
    location: string;
    status: ApplicationStatus;
    appliedDate: string;
    notes: string;
  }
): Promise<void> {
  const path = `students/${uid}/applications/${applicationId}`;
  try {
    await updateDoc(doc(db, 'students', uid, 'applications', applicationId), {
      company: input.company.trim().slice(0, 120),
      role: input.role.trim().slice(0, 120),
      packageLpa: input.packageLpa.trim().slice(0, 40),
      location: input.location.trim().slice(0, 100),
      status: input.status,
      appliedDate: input.appliedDate.slice(0, 20),
      notes: input.notes.trim().slice(0, 1000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteJobApplication(uid: string, applicationId: string): Promise<void> {
  const path = `students/${uid}/applications/${applicationId}`;
  try {
    await deleteDoc(doc(db, 'students', uid, 'applications', applicationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToResumeAnalyses(
  uid: string,
  onData: (items: ResumeAnalysis[]) => void,
  onError: (err: Error) => void
) {
  const path = `students/${uid}/resumeAnalyses`;
  const q = query(
    collection(db, 'students', uid, 'resumeAnalyses'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResumeAnalysis, 'id'>) })));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function saveResumeAnalysisResult(
  student: StudentProfile,
  result: {
    fileName: string;
    targetRole: string;
    atsScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    strengths: string[];
    improvements: string[];
    summary: string;
  },
  bestInterviewScore: number,
  previousBestAts: number
): Promise<void> {
  const path = `students/${student.uid}/resumeAnalyses`;
  try {
    await addDoc(collection(db, 'students', student.uid, 'resumeAnalyses'), {
      uid: student.uid,
      fileName: result.fileName.slice(0, 150),
      targetRole: result.targetRole.slice(0, 120),
      atsScore: result.atsScore,
      matchedKeywords: result.matchedKeywords.slice(0, 30),
      missingKeywords: result.missingKeywords.slice(0, 30),
      strengths: result.strengths.slice(0, 15),
      improvements: result.improvements.slice(0, 15),
      summary: result.summary.slice(0, 2000),
      createdAt: serverTimestamp(),
    });

    const streakInfo = computeUpdatedStreak(student);
    const nextXp = (student.xp || 0) + 45;
    const bestAts = Math.max(previousBestAts, result.atsScore);
    const nextReadiness = calculateReadinessScore({
      completedRoadmapCount: student.completedRoadmapTaskIds.length,
      skillAssessments: student.skillAssessments,
      questionsSolved: student.questionsSolved,
      bestAtsScore: bestAts,
      bestInterviewScore,
      currentStreak: streakInfo.currentStreak,
    });
    const nextBadges = evaluateBadges({
      currentBadges: student.badges,
      profileCompleted: student.profileCompleted,
      roadmapCount: student.completedRoadmapTaskIds.length,
      questionsSolved: student.questionsSolved,
      currentStreak: streakInfo.currentStreak,
      bestAtsScore: bestAts,
      bestInterviewScore,
    });

    await updateDoc(doc(db, 'students', student.uid), {
      xp: nextXp,
      readinessScore: nextReadiness,
      badges: nextBadges,
      ...streakInfo,
      updatedAt: serverTimestamp(),
    });
    await logLearningActivity(
      student.uid,
      `ATS Resume Diagnostic (${result.targetRole}): ${result.atsScore}/100`,
      'Resume',
      45
    );
    await syncLeaderboardEntry({
      ...student,
      xp: nextXp,
      readinessScore: nextReadiness,
      currentStreak: streakInfo.currentStreak,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToMockInterviews(
  uid: string,
  onData: (items: MockInterviewRecord[]) => void,
  onError: (err: Error) => void
) {
  const path = `students/${uid}/mockInterviews`;
  const q = query(
    collection(db, 'students', uid, 'mockInterviews'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MockInterviewRecord, 'id'>) })));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function saveMockInterviewResult(
  student: StudentProfile,
  result: {
    interviewType: InterviewType;
    topic: string;
    difficulty: DifficultyLevel;
    score: number;
    questionsCount: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  },
  bestAtsScore: number,
  previousBestInterview: number
): Promise<void> {
  const path = `students/${student.uid}/mockInterviews`;
  try {
    await addDoc(collection(db, 'students', student.uid, 'mockInterviews'), {
      uid: student.uid,
      interviewType: result.interviewType,
      topic: result.topic.slice(0, 150),
      difficulty: result.difficulty,
      score: result.score,
      questionsCount: result.questionsCount,
      feedback: result.feedback.slice(0, 3000),
      strengths: result.strengths.slice(0, 10),
      weaknesses: result.weaknesses.slice(0, 10),
      createdAt: serverTimestamp(),
    });

    const streakInfo = computeUpdatedStreak(student);
    const nextXp = (student.xp || 0) + 60;
    const bestInterview = Math.max(previousBestInterview, result.score);
    const nextReadiness = calculateReadinessScore({
      completedRoadmapCount: student.completedRoadmapTaskIds.length,
      skillAssessments: student.skillAssessments,
      questionsSolved: student.questionsSolved,
      bestAtsScore,
      bestInterviewScore: bestInterview,
      currentStreak: streakInfo.currentStreak,
    });
    const nextBadges = evaluateBadges({
      currentBadges: student.badges,
      profileCompleted: student.profileCompleted,
      roadmapCount: student.completedRoadmapTaskIds.length,
      questionsSolved: student.questionsSolved,
      currentStreak: streakInfo.currentStreak,
      bestAtsScore,
      bestInterviewScore: bestInterview,
    });

    await updateDoc(doc(db, 'students', student.uid), {
      xp: nextXp,
      readinessScore: nextReadiness,
      badges: nextBadges,
      ...streakInfo,
      updatedAt: serverTimestamp(),
    });
    await logLearningActivity(
      student.uid,
      `Completed ${result.interviewType} Mock Interview: ${result.score}/100`,
      'Interview',
      60
    );
    await syncLeaderboardEntry({
      ...student,
      xp: nextXp,
      readinessScore: nextReadiness,
      currentStreak: streakInfo.currentStreak,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToActivityLogs(
  uid: string,
  onData: (items: ActivityLog[]) => void,
  onError: (err: Error) => void
) {
  const path = `students/${uid}/activityLogs`;
  const q = query(
    collection(db, 'students', uid, 'activityLogs'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityLog, 'id'>) })));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export function subscribeToAiChats(
  uid: string,
  onData: (items: AiChatMessage[]) => void,
  onError: (err: Error) => void
) {
  const path = `students/${uid}/aiChats`;
  const q = query(
    collection(db, 'students', uid, 'aiChats'),
    where('uid', '==', uid),
    orderBy('createdAt', 'asc'),
    limit(60)
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AiChatMessage, 'id'>) })));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}

export async function appendAiChatMessage(
  uid: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const path = `students/${uid}/aiChats`;
  try {
    await addDoc(collection(db, 'students', uid, 'aiChats'), {
      uid,
      role,
      content: content.slice(0, 8000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function clearAiChatHistory(uid: string, messageIds: string[]): Promise<void> {
  const path = `students/${uid}/aiChats`;
  try {
    await Promise.all(messageIds.map((id) => deleteDoc(doc(db, 'students', uid, 'aiChats', id))));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToLeaderboard(
  onData: (items: LeaderboardEntry[]) => void,
  onError: (err: Error) => void
) {
  const path = 'leaderboard';
  const q = query(collection(db, 'leaderboard'), where('isPublic', '==', true), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      const entries = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<LeaderboardEntry, 'id'>) }))
        .sort((a, b) => (b.xp || 0) - (a.xp || 0));
      onData(entries);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );
}
