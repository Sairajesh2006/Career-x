import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'career-x-api' });
  });

  // 1. AI Career Assistant Endpoint
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { prompt, studentContext, history } = req.body as {
        prompt?: string;
        studentContext?: {
          fullName?: string;
          college?: string;
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
          skillAssessments?: Record<string, number>;
        };
        history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      };

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      const ai = getGeminiClient();
      const profileSummary = studentContext
        ? `Student Profile:
- Name: ${studentContext.fullName || 'Student'}
- College: ${studentContext.college || 'Not specified'} (${studentContext.branch || 'N/A'}, ${studentContext.academicYear || 'N/A'})
- CGPA: ${typeof studentContext.cgpa === 'number' ? studentContext.cgpa : 'N/A'}
- Target Role: ${studentContext.preferredRole || 'Software Engineer'}
- Target Package: ${studentContext.targetPackage || 'Not specified'}
- Known Languages: ${(studentContext.languages || []).join(', ') || 'None listed'}
- Skill Level: ${studentContext.skillLevel || 'Not specified'}
- Placement Readiness Score: ${studentContext.readinessScore ?? 0}/100
- Coding Questions Solved: ${studentContext.questionsSolved ?? 0}
- Roadmap Tasks Completed: ${studentContext.completedTasksCount ?? 0}/21
- Skill Assessments: ${JSON.stringify(studentContext.skillAssessments || {})}`
        : 'No student profile context provided.';

      const recentHistory = (history || [])
        .slice(-8)
        .map((m) => `${m.role === 'user' ? 'Student' : 'Mentor'}: ${m.content}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : ''}Student Question: ${prompt.trim()}`,
        config: {
          systemInstruction: `You are the Career-X AI Placement Mentor. Give specific, practical, structured, and encouraging guidance tailored to the student's actual profile and current placement progress. Keep answers concise (under 250 words unless a detailed study plan is requested) with clear bullet points and concrete next steps.\n\n${profileSummary}`,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        return res.status(502).json({ error: 'Empty response from AI mentor.' });
      }

      res.json({ reply });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate mentor response.';
      res.status(500).json({ error: message });
    }
  });

  // 2. ATS Resume Diagnostic Endpoint
  app.post('/api/ai/analyze-resume', async (req, res) => {
    try {
      const { resumeText, targetRole, studentProfile } = req.body as {
        resumeText?: string;
        targetRole?: string;
        studentProfile?: { preferredRole?: string; languages?: string[]; branch?: string };
      };

      if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 40) {
        return res.status(400).json({ error: 'Please provide at least 40 characters of resume text for ATS analysis.' });
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
              atsScore: { type: Type.INTEGER, description: 'ATS compatibility and quality score between 0 and 100.' },
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
            required: ['atsScore', 'matchedKeywords', 'missingKeywords', 'strengths', 'improvements', 'summary'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json({
        atsScore: Math.max(0, Math.min(100, Number(parsed.atsScore) || 0)),
        matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.slice(0, 20) : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 20) : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 10) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 10) : [],
        summary: typeof parsed.summary === 'string' ? parsed.summary : 'Resume diagnostic completed.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze resume.';
      res.status(500).json({ error: message });
    }
  });

  // 3. Mock Interview Question Generator
  app.post('/api/ai/mock-interview/questions', async (req, res) => {
    try {
      const { interviewType, topic, difficulty, preferredRole } = req.body as {
        interviewType?: string;
        topic?: string;
        difficulty?: string;
        preferredRole?: string;
      };

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
      res.json({ questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate mock interview questions.';
      res.status(500).json({ error: message });
    }
  });

  // 4. Mock Interview Answer Evaluator
  app.post('/api/ai/mock-interview/evaluate', async (req, res) => {
    try {
      const { interviewType, topic, difficulty, qaPairs } = req.body as {
        interviewType?: string;
        topic?: string;
        difficulty?: string;
        qaPairs?: Array<{ question: string; answer: string }>;
      };

      if (!Array.isArray(qaPairs) || qaPairs.length === 0) {
        return res.status(400).json({ error: 'Interview answers are required for evaluation.' });
      }

      const ai = getGeminiClient();
      const formattedQA = qaPairs
        .map((pair, idx) => `Q${idx + 1}: ${pair.question}\nStudent Answer: ${pair.answer || '(No answer provided)'}`)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Track: ${interviewType}\nTopic: ${topic}\nDifficulty: ${difficulty}\n\n${formattedQA}`,
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
      res.json({
        score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
        feedback: typeof parsed.feedback === 'string' ? parsed.feedback : 'Interview evaluated.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 8) : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 8) : [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to evaluate mock interview.';
      res.status(500).json({ error: message });
    }
  });

  // 5. Skill Gap Diagnostic Endpoint
  app.post('/api/ai/skill-gap', async (req, res) => {
    try {
      const { preferredRole, skillLevel, languages, skillAssessments } = req.body as {
        preferredRole?: string;
        skillLevel?: string;
        languages?: string[];
        skillAssessments?: Record<string, number>;
      };

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Target Role: ${preferredRole || 'Software Engineer'}\nCurrent Level: ${skillLevel || 'Beginner'}\nKnown Languages: ${(languages || []).join(', ') || 'None'}\nSelf-Assessed Scores (0-100): ${JSON.stringify(skillAssessments || {})}`,
        config: {
          systemInstruction:
            'Provide a crisp 3-4 sentence personalized skill gap diagnostic and top 2 weekly focus priorities for this student based strictly on their scores and target role. Avoid generic filler.',
        },
      });

      const summary = response.text?.trim() || 'Skill gap diagnostic updated based on your latest assessment.';
      res.json({ summary });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze skill gaps.';
      res.status(500).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career-X server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Career-X server:', err);
  process.exit(1);
});
