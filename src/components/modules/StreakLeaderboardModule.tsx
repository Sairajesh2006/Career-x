import React, { useMemo, useState } from 'react';
import { Award, CalendarCheck2, Flame, Lock, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { BADGE_DEFINITIONS } from '../../data/curriculum';
import { getTodayDateString, recordDailyStreakCheckIn } from '../../services/studentService';
import { LeaderboardEntry, StudentProfile } from '../../types/careerx';

interface StreakLeaderboardModuleProps {
  student: StudentProfile;
  leaderboard: LeaderboardEntry[];
  bestAtsScore: number;
  bestInterviewScore: number;
}

export const StreakLeaderboardModule: React.FC<StreakLeaderboardModuleProps> = ({
  student,
  leaderboard,
  bestAtsScore,
  bestInterviewScore,
}) => {
  const [checkingIn, setCheckingIn] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = getTodayDateString();
  const checkedInToday = student.lastActiveDate === today;

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setNotice(null);
    setError(null);
    try {
      const res = await recordDailyStreakCheckIn(student, bestAtsScore, bestInterviewScore);
      if (res.alreadyCheckedIn) {
        setNotice("Today's preparation check-in is already recorded.");
      } else {
        setNotice('Daily preparation streak recorded (+25 XP).');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record streak check-in.');
    } finally {
      setCheckingIn(false);
    }
  };

  // Last 56 days heatmap
  const calendarDays = useMemo(() => {
    const activeSet = new Set(student.activityDates || []);
    const days: Array<{ date: string; active: boolean }> = [];
    const base = new Date();
    for (let i = 55; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      days.push({ date: dateStr, active: activeSet.has(dateStr) });
    }
    return days;
  }, [student.activityDates]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Streak Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Streak, Badges & Campus Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consistency compounds placement readiness. Check in daily or complete tasks to keep your streak active.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheckIn}
          disabled={checkingIn || checkedInToday}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            checkedInToday
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>
            {checkedInToday
              ? 'Checked In Today'
              : checkingIn
              ? 'Recording...'
              : 'Daily Streak Check-In (+25 XP)'}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
          {notice}
        </div>
      )}

      {/* Streak Stats + 8-Week Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 grid grid-cols-3 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <p className="text-xs text-slate-400">Current Streak</p>
            <p className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-2">
              {student.currentStreak}d
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <p className="text-xs text-slate-400">Longest Streak</p>
            <p className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
              {student.longestStreak}d
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <p className="text-xs text-slate-400">Total XP</p>
            <p className="text-2xl font-bold text-indigo-400 font-mono tabular-nums mt-2">
              {student.xp}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">56-Day Preparation Activity</span>
            <span className="text-slate-400 tabular-nums">
              {student.activityDates.length} active days logged
            </span>
          </div>
          <div className="grid grid-cols-14 gap-1.5">
            {calendarDays.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.active ? 'Active' : 'No activity'}`}
                className={`h-4 rounded-sm border ${
                  day.active
                    ? 'bg-emerald-500 border-emerald-400/50'
                    : 'bg-slate-950 border-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Achievement Badges</span>
          </h3>
          <span className="text-xs text-slate-400 tabular-nums">
            {student.badges.length} / {BADGE_DEFINITIONS.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const unlocked = student.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border space-y-1.5 ${
                  unlocked
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-950 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${unlocked ? 'text-amber-300' : 'text-slate-300'}`}>
                    {badge.title}
                  </span>
                  {unlocked ? (
                    <Award className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
                <p className="text-xs text-slate-500 pt-1">Goal: {badge.requirementLabel}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Multi-User Campus Leaderboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-400" />
              <span>Campus Placement Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live rankings from opted-in students only. Private records remain strictly isolated.
            </p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
            No opted-in students on the public leaderboard yet. Enable leaderboard visibility in Edit Profile to appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-3 px-4 font-medium">Rank</th>
                  <th className="py-3 px-4 font-medium">Student</th>
                  <th className="py-3 px-4 font-medium">Target Role</th>
                  <th className="py-3 px-4 font-medium text-right">Streak</th>
                  <th className="py-3 px-4 font-medium text-right">Solved</th>
                  <th className="py-3 px-4 font-medium text-right">Readiness</th>
                  <th className="py-3 px-4 font-medium text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {leaderboard.map((entry, idx) => {
                  const isYou = entry.uid === student.uid;
                  return (
                    <tr
                      key={entry.uid}
                      className={isYou ? 'bg-indigo-600/10' : 'hover:bg-slate-800/30'}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-300 tabular-nums">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">
                          {entry.displayName} {isYou ? '(You)' : ''}
                        </p>
                        <p className="text-xs text-slate-500">{entry.college || 'Campus Student'}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        {entry.preferredRole || 'SDE'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-amber-400 tabular-nums">
                        {entry.currentStreak}d
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-200 tabular-nums">
                        {entry.questionsSolved}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-emerald-400 tabular-nums">
                        {entry.readinessScore}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-indigo-400 tabular-nums">
                        {entry.xp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
