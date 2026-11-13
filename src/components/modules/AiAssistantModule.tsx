import React, { useState } from 'react';
import { Bot, Send, Trash2, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { appendAiChatMessage, clearAiChatHistory } from '../../services/studentService';
import { AiChatMessage, StudentProfile } from '../../types/careerx';

interface AiAssistantModuleProps {
  student: StudentProfile;
  messages: AiChatMessage[];
}

const STARTER_PROMPTS = [
  'Create a 14-day study plan tailored to my current readiness and target role.',
  'Which skill gap should I close first before campus placement season?',
  'Give me 3 strong project bullet points using X-Y-Z impact metrics.',
  'How should I structure my introduction for a technical interview?',
];

export const AiAssistantModule: React.FC<AiAssistantModuleProps> = ({ student, messages }) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    setInput('');

    try {
      await appendAiChatMessage(student.uid, 'user', trimmed);

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          studentContext: {
            fullName: student.fullName,
            college: student.college,
            branch: student.branch,
            academicYear: student.academicYear,
            cgpa: student.cgpa,
            preferredRole: student.preferredRole,
            targetPackage: student.targetPackage,
            languages: student.languages,
            skillLevel: student.skillLevel,
            readinessScore: student.readinessScore,
            questionsSolved: student.questionsSolved,
            completedTasksCount: student.completedRoadmapTaskIds.length,
            skillAssessments: student.skillAssessments,
          },
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Failed to get AI mentor response.');
      }

      await appendAiChatMessage(student.uid, 'assistant', data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to contact AI Career Assistant.');
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (messages.length === 0) return;
    await clearAiChatHistory(
      student.uid,
      messages.map((m) => m.id)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 h-full flex flex-col"
    >
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <span>AI Career Assistant</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded in your live profile ({student.preferredRole || 'SDE'} · Readiness {student.readinessScore}/100)
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-400 hover:text-rose-300 hover:border-rose-500/30 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Chat Viewport */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex-1 min-h-[420px] max-h-[580px] flex flex-col justify-between gap-4">
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {messages.length === 0 ? (
            <div className="py-8 space-y-5">
              <div className="text-center max-w-md mx-auto space-y-2">
                <Bot className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-sm font-semibold text-white">
                  Ask your Career-X AI Placement Mentor
                </p>
                <p className="text-xs text-slate-400">
                  Every conversation is saved to your student account so you can revisit study plans anytime.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-2xl mx-auto">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
              <span>Mentor is preparing a personalized response...</span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendPrompt(input);
          }}
          className="flex items-center gap-2 pt-3 border-t border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about DSA prep, resume bullets, interview strategy, or study schedules..."
            disabled={sending}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
};
