import { GoogleGenAI, Type } from '@google/genai';

export interface StudentAiContext {
  fullName?: string;
  college?: string;
  degree?: string;
  branch?: string;
  academicYear?: string;
  cgpa?: number;
  preferredRole?: string;
  targetPackage?: string;
  languages?: string[];
  skillLevel?: string;
  readinessScore?: number;
  questionsSolved?: number;
  completedTasksCount?: number;
  currentStreak?: number;
  xp?: number;
  skillAssessments?: Record<string, number>;
  skillGapSummary?: string;
  applicationsSummary?: string;
  latestAtsScore?: number;
  missingResumeKeywords?: string[];
  latestMockInterview?: string;
  nextRoadmapTasks?: string[];
}

export class ApiHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || !apiKey.trim()) {
    throw new ApiHttpError(
      500,
      'GEMINI_API_KEY is not configured in the server environment variables.'
    );
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function runAiAssistant(body: {
  prompt?: string;
  studentContext?: StudentAiContext;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{ reply: string }> {
  const { prompt, studentContext, history } = body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new ApiHttpError(400, 'Please enter a question or message before sending.');
  }

  const ai = getGeminiClient();
  const ctx = studentContext;

  const profileSummary = ctx
    ? `Student Profile & Live Placement Data:
- Name: ${ctx.fullName || 'Student'}
- College: ${ctx.college || 'Not specified'} (${ctx.degree || ''} ${ctx.branch || 'N/A'}, ${ctx.academicYear || 'N/A'})
- CGPA: ${typeof ctx.cgpa === 'number' ? ctx.cgpa : 'N/A'}
- Target Role: ${ctx.preferredRole || 'Software Engineer'}
- Target Package: ${ctx.targetPackage || 'Not specified'}
- Known Languages: ${(ctx.languages || []).join(', ') || 'None listed'}
- Skill Level: ${ctx.skillLevel || 'Not specified'}
- Placement Readiness Score: ${ctx.readinessScore ?? 0}/100
- Coding Questions Solved: ${ctx.questionsSolved ?? 0}
- Roadmap Tasks Completed: ${ctx.completedTasksCount ?? 0}/21
- Current Streak / XP: ${ctx.currentStreak ?? 0} days / ${ctx.xp ?? 0} XP
- Skill Assessments: ${JSON.stringify(ctx.skillAssessments || {})}
- Skill Gap Summary: ${ctx.skillGapSummary || 'Not yet assessed'}
- Application Pipeline: ${ctx.applicationsSummary || 'No applications logged yet'}
- Latest Resume ATS Score: ${typeof ctx.latestAtsScore === 'number' && ctx.latestAtsScore > 0 ? `${ctx.latestAtsScore}/100` : 'Not analyzed yet'}
- Missing Resume Keywords: ${(ctx.missingResumeKeywords || []).join(', ') || 'None recorded'}
- Latest Mock Interview: ${ctx.latestMockInterview || 'None completed yet'}
- Upcoming Roadmap Tasks: ${(ctx.nextRoadmapTasks || []).join('; ') || 'All tasks completed'}`
    : 'No student profile context provided.';

  const recentHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .filter((m) => m && typeof m.content === 'string')
        .map((m) => `${m.role === 'user' ? 'Student' : 'Mentor'}: ${m.content}`)
        .join('\n')
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `${recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : ''}Student Question: ${prompt.trim()}`,
    config: {
      systemInstruction: `You are the Career-X AI Placement Mentor. Give specific, practical, structured, and encouraging guidance tailored directly to the student's real profile and placement preparation data below. Reference their actual numbers, missing skills, target role, or next roadmap tasks when helpful. Keep answers concise (under 280 words unless a detailed study plan is requested) with clear bullet points and concrete next steps.\n\n${profileSummary}`,
    },
  });

  const reply = response.text?.trim();
  if (!reply) {
    throw new ApiHttpError(502, 'The AI mentor returned an empty response. Please try again.');
  }

  return { reply };
}

export async function runResumeAnalysis(body: {
  resumeText?: string;
  targetRole?: string;
  studentProfile?: { preferredRole?: string; languages?: string[]; branch?: string };
}): Promise<{
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
}> {
  const { resumeText, targetRole, studentProfile } = body || {};
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 40) {
    throw new ApiHttpError(
      400,
      'Please provide at least 40 characters of resume text for ATS analysis.'
    );
  }

  const ai = getGeminiClient();
  const role = targetRole?.trim() || studentProfile?.preferredRole || 'Software Development Engineer';

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Target Role: ${role}\nKnown Languages: ${(studentProfile?.languages || []).join(', ') || 'Not listed'}\n\nResume Content:\n${resumeText.slice(0, 12000)}`,
    config: {
      systemInstruction:
        'You are a strict ATS (Applicant Tracking System) & Technical Recruiter evaluating an engineering student resume for campus/entry-level placements. Score honestly from 0 to 100 based on quantified impact, technical keywords, project depth, structure, and role alignment.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          atsScore: {
            type: Type.INTEGER,
            description: 'ATS compatibility and quality score between 0 and 100.',
          },
          matchedKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Up to 12 strong technical or role keywords found in the resume.',
          },
          missingKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Up to 12 important keywords or skills missing for the target role.',
          },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 5 specific strengths observed in the resume.',
          },
          improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 5 concrete, actionable improvements.',
          },
          summary: {
            type: Type.STRING,
            description: '2-3 sentence diagnostic executive summary.',
          },
        },
        required: [
          'atsScore',
          'matchedKeywords',
          'missingKeywords',
          'strengths',
          'improvements',
          'summary',
        ],
      },
    },
  });

  const parsed = JSON.parse((response.text || '{}').trim());
  return {
    atsScore: Math.max(0, Math.min(100, Number(parsed.atsScore) || 0)),
    matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.slice(0, 20) : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 20) : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 10) : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 10) : [],
    summary: typeof parsed.summary === 'string' ? parsed.summary : 'Resume diagnostic completed.',
  };
}

export async function runMockInterviewQuestions(body: {
  interviewType?: string;
  topic?: string;
  difficulty?: string;
  preferredRole?: string;
}): Promise<{ questions: Array<{ id: string; question: string; focusArea: string }> }> {
  const { interviewType, topic, difficulty, preferredRole } = body || {};
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Generate 3 realistic placement interview questions.\nTrack: ${interviewType || 'DSA & Coding'}\nTopic: ${topic || 'Arrays & Hashing'}\nDifficulty: ${difficulty || 'Medium'}\nTarget Role: ${preferredRole || 'Software Engineer'}`,
    config: {
      systemInstruction:
        'You are a technical interviewer conducting a campus placement interview. Return 3 crisp, distinct questions with expected focus areas.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                focusArea: { type: Type.STRING },
              },
              required: ['id', 'question', 'focusArea'],
            },
          },
        },
        required: ['questions'],
      },
    },
  });

  const parsed = JSON.parse((response.text || '{}').trim());
  return {
    questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : [],
  };
}

export async function runMockInterviewEvaluation(body: {
  interviewType?: string;
  topic?: string;
  difficulty?: string;
  qaPairs?: Array<{ question: string; answer: string }>;
}): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}> {
  const { interviewType, topic, difficulty, qaPairs } = body || {};
  if (!Array.isArray(qaPairs) || qaPairs.length === 0) {
    throw new ApiHttpError(400, 'Interview answers are required for evaluation.');
  }

  const ai = getGeminiClient();
  const formattedQA = qaPairs
    .map((pair, idx) => `Q${idx + 1}: ${pair.question}\nStudent Answer: ${pair.answer || '(No answer provided)'}`)
    .join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Track: ${interviewType || 'Technical'}\nTopic: ${topic || 'General'}\nDifficulty: ${difficulty || 'Medium'}\n\n${formattedQA}`,
    config: {
      systemInstruction:
        'You are a senior placement interviewer evaluating a candidate’s written responses. Grade fairly and rigorously from 0 to 100. If answers are blank or superficial, score low and explain what a strong answer covers.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: 'Overall interview score 0-100.' },
          feedback: { type: Type.STRING, description: 'Detailed evaluation across all questions.' },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2-4 specific strengths demonstrated.',
          },
          weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2-4 areas that need improvement.',
          },
        },
        required: ['score', 'feedback', 'strengths', 'weaknesses'],
      },
    },
  });

  const parsed = JSON.parse((response.text || '{}').trim());
  return {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    feedback: typeof parsed.feedback === 'string' ? parsed.feedback : 'Interview evaluated.',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 8) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 8) : [],
  };
}

export async function runSkillGapDiagnostic(body: {
  preferredRole?: string;
  skillLevel?: string;
  languages?: string[];
  skillAssessments?: Record<string, number>;
}): Promise<{ summary: string }> {
  const { preferredRole, skillLevel, languages, skillAssessments } = body || {};
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Target Role: ${preferredRole || 'Software Engineer'}\nCurrent Level: ${skillLevel || 'Beginner'}\nKnown Languages: ${(languages || []).join(', ') || 'None'}\nSelf-Assessed Scores (0-100): ${JSON.stringify(skillAssessments || {})}`,
    config: {
      systemInstruction:
        'Provide a crisp 3-4 sentence personalized skill gap diagnostic and top 2 weekly focus priorities for this student based strictly on their scores and target role. Avoid generic filler.',
    },
  });

  const summary =
    response.text?.trim() || 'Skill gap diagnostic updated based on your latest assessment.';
  return { summary };
}
