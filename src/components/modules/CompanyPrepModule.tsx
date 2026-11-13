import React, { useState } from 'react';
import { Building2, CheckCircle2, Circle, ExternalLink, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { COMPANY_PREP_BANK } from '../../data/curriculum';
import { toggleCompanyQuestionSolved } from '../../services/studentService';
import { StudentProfile } from '../../types/careerx';

interface CompanyPrepModuleProps {
  student: StudentProfile;
  bestAtsScore: number;
  bestInterviewScore: number;
}

export const CompanyPrepModule: React.FC<CompanyPrepModuleProps> = ({
  student,
  bestAtsScore,
  bestInterviewScore,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState(COMPANY_PREP_BANK[0].id);
  const [revealedHintId, setRevealedHintId] = useState<string | null>(null);
  const [busyQuestionId, setBusyQuestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solvedIds = student.solvedQuestionIds || [];
  const activeCompany =
    COMPANY_PREP_BANK.find((c) => c.id === selectedCompanyId) || COMPANY_PREP_BANK[0];

  const handleToggleSolved = async (questionId: string, title: string) => {
    setBusyQuestionId(questionId);
    setError(null);
    try {
      await toggleCompanyQuestionSolved(
        student,
        questionId,
        title,
        bestAtsScore,
        bestInterviewScore
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save question progress.');
    } finally {
      setBusyQuestionId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Company Preparation Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Practice company-tagged interview problems and track solved count (+30 XP per problem).
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-400">Problems Solved</p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">
            {student.questionsSolved}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Company Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {COMPANY_PREP_BANK.map((comp) => {
          const compSolved = comp.questions.filter((q) => solvedIds.includes(q.id)).length;
          const active = comp.id === activeCompany.id;
          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => setSelectedCompanyId(comp.id)}
              className={`p-3.5 rounded-xl border text-left transition-colors ${
                active
                  ? 'bg-indigo-600/15 border-indigo-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <p className="text-sm font-bold text-white truncate">{comp.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{comp.tier}</p>
              <p className="text-xs font-mono text-emerald-400 mt-2 tabular-nums">
                {compSolved}/{comp.questions.length} solved
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Company Prep Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h3 className="text-lg font-bold text-white">{activeCompany.name} Interview Blueprint</h3>
            <p className="text-xs text-slate-400 mt-1">
              Format: {activeCompany.interviewFormat} · Compensation: {activeCompany.avgPackage}
            </p>
          </div>
          <div className="text-xs text-slate-300">
            Focus: {activeCompany.focusAreas.join(' · ')}
          </div>
        </div>

        <div className="space-y-3">
          {activeCompany.questions.map((q) => {
            const solved = solvedIds.includes(q.id);
            const hintOpen = revealedHintId === q.id;
            const busy = busyQuestionId === q.id;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-colors space-y-3 ${
                  solved
                    ? 'bg-emerald-500/5 border-emerald-500/25'
                    : 'bg-slate-950 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggleSolved(q.id, q.title)}
                      aria-label={solved ? `Unmark ${q.title}` : `Mark ${q.title} solved`}
                      className={`mt-0.5 shrink-0 ${
                        solved ? 'text-emerald-400' : 'text-slate-500 hover:text-indigo-400'
                      }`}
                    >
                      {solved ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-white">{q.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pattern: {q.pattern} · Difficulty: {q.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-8 sm:pl-0 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRevealedHintId(hintOpen ? null : q.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-amber-300 flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{hintOpen ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                    <a
                      href={q.practiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1"
                    >
                      <span>Solve</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggleSolved(q.id, q.title)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        solved
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {busy ? 'Saving...' : solved ? 'Solved' : 'Mark Solved'}
                    </button>
                  </div>
                </div>

                {hintOpen && (
                  <div className="ml-8 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-amber-400">Approach Hint: </span>
                    {q.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
