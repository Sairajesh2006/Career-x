import React, { useState } from 'react';
import { CheckCircle2, FileText, Sparkles, Upload, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { saveResumeAnalysisResult } from '../../services/studentService';
import { ResumeAnalysis, StudentProfile } from '../../types/careerx';

interface ResumeAnalyzerModuleProps {
  student: StudentProfile;
  analyses: ResumeAnalysis[];
  bestInterviewScore: number;
}

export const ResumeAnalyzerModule: React.FC<ResumeAnalyzerModuleProps> = ({
  student,
  analyses,
  bestInterviewScore,
}) => {
  const [targetRole, setTargetRole] = useState(
    student.preferredRole || 'Software Development Engineer'
  );
  const [fileName, setFileName] = useState('Resume_Text.txt');
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ResumeAnalysis | null>(null);

  const previousBestAts = analyses.reduce((max, item) => Math.max(max, item.atsScore || 0), 0);
  const activeReport = selectedReport || analyses[0] || null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text();
      setResumeText(text.slice(0, 12000));
    } else {
      setError(
        'For best accuracy on PDF/DOCX files, paste the extracted text from your resume below (plain .txt/.md files load automatically).'
      );
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (resumeText.trim().length < 40) {
      setError('Please paste at least 40 characters of your resume content before running ATS analysis.');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
          studentProfile: {
            preferredRole: student.preferredRole,
            languages: student.languages,
            branch: student.branch,
          },
        }),
      });
      const data = (await response.json()) as {
        atsScore?: number;
        matchedKeywords?: string[];
        missingKeywords?: string[];
        strengths?: string[];
        improvements?: string[];
        summary?: string;
        error?: string;
      };

      if (!response.ok || typeof data.atsScore !== 'number') {
        throw new Error(data.error || 'Resume analysis failed.');
      }

      await saveResumeAnalysisResult(
        student,
        {
          fileName: fileName || 'Pasted Resume',
          targetRole,
          atsScore: data.atsScore,
          matchedKeywords: data.matchedKeywords || [],
          missingKeywords: data.missingKeywords || [],
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          summary: data.summary || 'ATS diagnostic completed.',
        },
        bestInterviewScore,
        previousBestAts
      );
      setSelectedReport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze resume.');
    } finally {
      setAnalyzing(false);
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
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>ATS Resume Analyzer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Run an AI-powered ATS keyword and impact audit. All reports save permanently to your profile (+45 XP).
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-400">Highest Saved Score</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {previousBestAts > 0 ? `${previousBestAts}/100` : '—'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <form
          onSubmit={handleAnalyze}
          className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-white">Submit Resume for Diagnostic</h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Backend Engineer"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Upload Resume Text (.txt / .md) or Paste Below
            </label>
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-xs text-slate-300 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{fileName || 'Choose .txt or .md file'}</span>
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Resume Content
            </label>
            <textarea
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume sections here (Education, Technical Skills, Projects with quantified results, Internships)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? 'Running ATS Diagnostic...' : 'Analyze Resume with AI'}</span>
          </button>
        </form>

        {/* Report Viewer & History */}
        <div className="lg:col-span-7 space-y-5">
          {activeReport ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <p className="text-xs text-slate-400">
                    {activeReport.fileName} · {activeReport.targetRole}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-0.5">ATS Diagnostic Report</h3>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">ATS Score</p>
                  <p
                    className={`text-2xl font-bold font-mono tabular-nums ${
                      activeReport.atsScore >= 75
                        ? 'text-emerald-400'
                        : activeReport.atsScore >= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {activeReport.atsScore}/100
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">{activeReport.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matched Keywords</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeReport.matchedKeywords.length > 0
                      ? activeReport.matchedKeywords.join(' · ')
                      : 'None detected'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missing Target Keywords</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeReport.missingKeywords.length > 0
                      ? activeReport.missingKeywords.join(' · ')
                      : 'No major keyword gaps found'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white">Observed Strengths</p>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                    {activeReport.strengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white">Priority Improvements</p>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                    {activeReport.improvements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-white">No resume diagnostics saved yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Paste your resume content on the left to compute your real ATS compatibility score and missing role keywords.
              </p>
            </div>
          )}

          {analyses.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">Saved Analysis History</h4>
              <div className="space-y-2">
                {analyses.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedReport(item)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      activeReport?.id === item.id
                        ? 'bg-indigo-600/15 border-indigo-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{item.fileName}</p>
                      <p className="text-xs text-slate-500">{item.targetRole}</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-indigo-400 tabular-nums">
                      {item.atsScore}/100
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
