import React, { useState } from 'react';
import { Award, CheckCircle2, MessageSquareCode, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { saveMockInterviewResult } from '../../services/studentService';
import {
  DifficultyLevel,
  InterviewType,
  MockInterviewRecord,
  StudentProfile,
} from '../../types/careerx';

interface GeneratedQuestion {
  id: string;
  question: string;
  focusArea: string;
}

interface MockInterviewModuleProps {
  student: StudentProfile;
  interviews: MockInterviewRecord[];
  bestAtsScore: number;
}

const TRACK_OPTIONS: InterviewType[] = [
  'DSA & Coding',
  'Core CS & System Design',
  'Behavioral & HR',
  'Full-Stack Role',
];

export const MockInterviewModule: React.FC<MockInterviewModuleProps> = ({
  student,
  interviews,
  bestAtsScore,
}) => {
  const [interviewType, setInterviewType] = useState<InterviewType>('DSA & Coding');
  const [topic, setTopic] = useState('Trees, Hashing & Complexity');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');

  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MockInterviewRecord | null>(null);

  const previousBestInterview = interviews.reduce((max, item) => Math.max(max, item.score || 0), 0);
  const activeRecord = selectedRecord || interviews[0] || null;

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGenerating(true);
    setQuestions([]);
    setAnswers({});

    try {
      const res = await fetch('/api/ai/mock-interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewType,
          topic,
          difficulty,
          preferredRole: student.preferredRole,
        }),
      });
      const data = (await res.json()) as { questions?: GeneratedQuestion[]; error?: string };
      if (!res.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || 'Could not generate interview questions.');
      }
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start mock interview.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEvaluating(true);

    try {
      const qaPairs = questions.map((q) => ({
        question: q.question,
        answer: answers[q.id] || '',
      }));

      const res = await fetch('/api/ai/mock-interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewType,
          topic,
          difficulty,
          qaPairs,
        }),
      });
      const data = (await res.json()) as {
        score?: number;
        feedback?: string;
        strengths?: string[];
        weaknesses?: string[];
        error?: string;
      };

      if (!res.ok || typeof data.score !== 'number') {
        throw new Error(data.error || 'Evaluation failed.');
      }

      await saveMockInterviewResult(
        student,
        {
          interviewType,
          topic,
          difficulty,
          score: data.score,
          questionsCount: questions.length,
          feedback: data.feedback || 'Mock interview evaluated.',
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
        },
        bestAtsScore,
        previousBestInterview
      );

      setQuestions([]);
      setAnswers({});
      setSelectedRecord(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate mock interview.');
    } finally {
      setEvaluating(false);
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
            <MessageSquareCode className="w-5 h-5 text-emerald-400" />
            <span>Mock Interview Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Practice realistic AI-evaluated technical, system design, and HR interviews (+60 XP per session).
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-400">Sessions Completed</p>
            <p className="text-xl font-bold text-white font-mono tabular-nums">{interviews.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Best Score</p>
            <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
              {previousBestInterview > 0 ? `${previousBestInterview}/100` : '—'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configurator or Active Session */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          {questions.length === 0 ? (
            <form onSubmit={handleStartSession} className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Configure Mock Session</h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Interview Track
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TRACK_OPTIONS.map((track) => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => setInterviewType(track)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-colors ${
                        interviewType === track
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {track}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Focus Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  placeholder="e.g., Dynamic Programming / DBMS Indexing / STAR Behavioral"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        difficulty === lvl
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>{generating ? 'Generating Interview Questions...' : 'Start Mock Interview'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitAnswers} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{interviewType}</h3>
                  <p className="text-xs text-slate-400">
                    {topic} · {difficulty}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuestions([])}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-indigo-400">
                        Question {idx + 1} · {q.focusArea}
                      </p>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{q.question}</p>
                    <textarea
                      rows={4}
                      required
                      value={answers[q.id] || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      placeholder="Write your approach, complexity, or structured response..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={evaluating}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{evaluating ? 'Evaluating Responses...' : 'Submit for AI Evaluation'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Evaluation & History */}
        <div className="lg:col-span-6 space-y-5">
          {activeRecord ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <p className="text-xs text-slate-400">
                    {activeRecord.interviewType} · {activeRecord.difficulty}
                  </p>
                  <h3 className="text-base font-bold text-white mt-0.5">{activeRecord.topic}</h3>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">Score</p>
                  <p className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                    {activeRecord.score}/100
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeRecord.feedback}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Strengths</span>
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                    {activeRecord.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Focus Next</span>
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                    {activeRecord.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <MessageSquareCode className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-white">No mock interviews recorded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Start a mock interview session on the left to practice answering technical or HR questions and save your evaluation.
              </p>
            </div>
          )}

          {interviews.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">Past Mock Interview Sessions</h4>
              <div className="space-y-2">
                {interviews.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRecord(item)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      activeRecord?.id === item.id
                        ? 'bg-indigo-600/15 border-indigo-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{item.topic}</p>
                      <p className="text-xs text-slate-500">
                        {item.interviewType} · {item.difficulty}
                      </p>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {item.score}/100
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
