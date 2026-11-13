import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, ExternalLink, Map as MapIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { ROADMAP_STAGES, TOTAL_ROADMAP_TASKS } from '../../data/curriculum';
import { toggleRoadmapTaskProgress } from '../../services/studentService';
import { StudentProfile } from '../../types/careerx';

interface RoadmapModuleProps {
  student: StudentProfile;
  bestAtsScore: number;
  bestInterviewScore: number;
}

export const RoadmapModule: React.FC<RoadmapModuleProps> = ({
  student,
  bestAtsScore,
  bestInterviewScore,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completedIds = student.completedRoadmapTaskIds || [];
  const totalCompleted = completedIds.length;
  const overallPct = Math.round((totalCompleted / TOTAL_ROADMAP_TASKS) * 100);

  const handleToggleTask = async (taskId: string, title: string) => {
    setBusyTaskId(taskId);
    setError(null);
    try {
      await toggleRoadmapTaskProgress(student, taskId, title, bestAtsScore, bestInterviewScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update roadmap progress.');
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header & Progress Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-emerald-400" />
            <span>Personalized 7-Stage Placement Roadmap</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailored track for{' '}
            <span className="text-slate-200 font-medium">{student.preferredRole || 'Software Engineer'}</span>{' '}
            · +50 XP and Readiness boost per completed milestone
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Overall Completion</p>
            <p className="text-lg font-bold text-white font-mono tabular-nums">
              {totalCompleted}/{TOTAL_ROADMAP_TASKS} Tasks ({overallPct}%)
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {(['all', 'pending', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Stage List */}
      <div className="space-y-5">
        {ROADMAP_STAGES.map((stage) => {
          const stageDone = stage.tasks.filter((t) => completedIds.includes(t.id)).length;
          const visibleTasks = stage.tasks.filter((t) => {
            const isDone = completedIds.includes(t.id);
            if (filter === 'pending') return !isDone;
            if (filter === 'completed') return isDone;
            return true;
          });

          if (visibleTasks.length === 0) return null;

          return (
            <div
              key={stage.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{stage.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{stage.subtitle}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                  <span>{stage.durationWeeks} weeks</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {stageDone}/{stage.tasks.length} done
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {visibleTasks.map((task) => {
                  const done = completedIds.includes(task.id);
                  const isBusy = busyTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        done
                          ? 'bg-emerald-500/5 border-emerald-500/25'
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleTask(task.id, task.title)}
                          aria-label={done ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                          className={`mt-0.5 shrink-0 transition-colors ${
                            done ? 'text-emerald-400' : 'text-slate-500 hover:text-indigo-400'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              done ? 'text-slate-300 line-through' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{task.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{task.difficulty}</span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Clock className="w-3 h-3" />
                              {task.estimatedHours}h
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 pl-8 sm:pl-0">
                        <a
                          href={task.resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span>{task.resourceTitle}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleTask(task.id, task.title)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            done
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {isBusy ? 'Saving...' : done ? 'Completed' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
