import React, { useEffect, useState } from 'react';
import { CheckCircle2, Radar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SKILL_DIMENSIONS } from '../../data/curriculum';
import { postAiJson } from '../../services/aiClient';
import { saveSkillAssessmentProgress } from '../../services/studentService';
import { StudentProfile } from '../../types/careerx';

interface SkillAnalyzerModuleProps {
  student: StudentProfile;
  bestAtsScore: number;
  bestInterviewScore: number;
}

export const SkillAnalyzerModule: React.FC<SkillAnalyzerModuleProps> = ({
  student,
  bestAtsScore,
  bestInterviewScore,
}) => {
  const [scores, setScores] = useState<Record<string, number>>(() => ({
    dsa: student.skillAssessments?.dsa ?? 0,
    systemDesign: student.skillAssessments?.systemDesign ?? 0,
    coreCs: student.skillAssessments?.coreCs ?? 0,
    development: student.skillAssessments?.development ?? 0,
    aptitude: student.skillAssessments?.aptitude ?? 0,
    communication: student.skillAssessments?.communication ?? 0,
  }));
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setScores({
      dsa: student.skillAssessments?.dsa ?? 0,
      systemDesign: student.skillAssessments?.systemDesign ?? 0,
      coreCs: student.skillAssessments?.coreCs ?? 0,
      development: student.skillAssessments?.development ?? 0,
      aptitude: student.skillAssessments?.aptitude ?? 0,
      communication: student.skillAssessments?.communication ?? 0,
    });
  }, [student.skillAssessments]);

  const avgScore = Math.round(
    SKILL_DIMENSIONS.reduce((sum, d) => sum + (scores[d.key] || 0), 0) / SKILL_DIMENSIONS.length
  );

  const handleSaveAndAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setStatusMsg(null);
    try {
      let summary = `Skill assessment updated (average proficiency: ${avgScore}%).`;
      try {
        const data = await postAiJson<{ summary?: string }>('/api/ai/skill-gap', {
          preferredRole: student.preferredRole,
          skillLevel: student.skillLevel,
          languages: student.languages,
          skillAssessments: scores,
        });
        if (data.summary) summary = data.summary;
      } catch {
        // Fallback summary still saves assessment reliably to Firestore
      }

      await saveSkillAssessmentProgress(student, scores, summary, bestAtsScore, bestInterviewScore);
      setStatusMsg('Skill assessment and gap diagnostic saved to your student record (+40 XP).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save skill assessment.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Custom SVG Radar Chart geometry
  const size = 300;
  const center = size / 2;
  const maxRadius = 105;
  const levels = [25, 50, 75, 100];

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / SKILL_DIMENSIONS.length - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const studentPolygon = SKILL_DIMENSIONS.map((d, i) => {
    const p = getPoint(i, scores[d.key] || 0);
    return `${p.x},${p.y}`;
  }).join(' ');

  const benchmarkPolygon = SKILL_DIMENSIONS.map((d, i) => {
    const p = getPoint(i, d.benchmark);
    return `${p.x},${p.y}`;
  }).join(' ');

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
            <Radar className="w-5 h-5 text-indigo-400" />
            <span>Skill Gap Analyzer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rate your current proficiency across 6 placement dimensions to benchmark against{' '}
            <span className="text-slate-200 font-medium">{student.preferredRole || 'SDE'}</span> expectations.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-400">Overall Skill Index</p>
          <p className="text-2xl font-bold text-indigo-400 font-mono tabular-nums">{avgScore}%</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Visualization */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Competency Radar</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-indigo-400 font-medium">You</span>
              <span className="text-emerald-400 font-medium">Role Target</span>
            </div>
          </div>

          <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] my-2">
            {levels.map((lvl) => {
              const pts = SKILL_DIMENSIONS.map((_, i) => {
                const p = getPoint(i, lvl);
                return `${p.x},${p.y}`;
              }).join(' ');
              return (
                <polygon
                  key={lvl}
                  points={pts}
                  fill="none"
                  stroke="rgba(148,163,184,0.16)"
                  strokeWidth="1"
                />
              );
            })}

            {SKILL_DIMENSIONS.map((dim, i) => {
              const outer = getPoint(i, 100);
              const labelPt = getPoint(i, 122);
              return (
                <g key={dim.key}>
                  <line
                    x1={center}
                    y1={center}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="rgba(148,163,184,0.16)"
                    strokeWidth="1"
                  />
                  <text
                    x={labelPt.x}
                    y={labelPt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-400 text-[10px] font-medium"
                  >
                    {dim.shortLabel}
                  </text>
                </g>
              );
            })}

            <polygon
              points={benchmarkPolygon}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <polygon
              points={studentPolygon}
              fill="rgba(99, 102, 241, 0.28)"
              stroke="#6366f1"
              strokeWidth="2"
            />
          </svg>

          {student.skillGapSummary ? (
            <div className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Saved Diagnostic Summary</span>
              </p>
              <p>{student.skillGapSummary}</p>
            </div>
          ) : (
            <div className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-500">
              Adjust your skill levels on the right and run the AI diagnostic to save your personalized gap report.
            </div>
          )}
        </div>

        {/* Interactive Skill Sliders */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Self-Assessment Controls</h3>
            <span className="text-xs text-slate-400">0% = Not started · 100% = Interview fluent</span>
          </div>

          <div className="space-y-4">
            {SKILL_DIMENSIONS.map((dim) => {
              const val = scores[dim.key] ?? 0;
              const gap = Math.max(0, dim.benchmark - val);
              return (
                <div
                  key={dim.key}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{dim.label}</p>
                      <p className="text-xs text-slate-500">{dim.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-indigo-400 tabular-nums">
                        {val}%
                      </span>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {gap > 0 ? `Gap: -${gap}%` : 'Target Met'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={val}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [dim.key]: Number(e.target.value),
                      }))
                    }
                    aria-label={dim.label}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveAndAnalyze}
              disabled={analyzing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Diagnosing & Saving...' : 'Save Assessment & Run AI Diagnostic'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
