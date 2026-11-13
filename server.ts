import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ApiHttpError,
  runAiAssistant,
  runMockInterviewEvaluation,
  runMockInterviewQuestions,
  runResumeAnalysis,
  runSkillGapDiagnostic,
} from './server/aiService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function handleRouteError(res: Response, error: unknown) {
  if (error instanceof ApiHttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  const message =
    error instanceof Error ? error.message : 'Unexpected server error while processing request.';
  res.status(500).json({ error: message });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'career-x-api',
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
    });
  });

  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const result = await runAiAssistant(req.body);
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post('/api/ai/analyze-resume', async (req, res) => {
    try {
      const result = await runResumeAnalysis(req.body);
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post('/api/ai/mock-interview/questions', async (req, res) => {
    try {
      const result = await runMockInterviewQuestions(req.body);
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post('/api/ai/mock-interview/evaluate', async (req, res) => {
    try {
      const result = await runMockInterviewEvaluation(req.body);
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post('/api/ai/skill-gap', async (req, res) => {
    try {
      const result = await runSkillGapDiagnostic(req.body);
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Always return JSON for unknown /api/* routes instead of HTML fallback
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Express JSON error middleware (e.g., malformed JSON request bodies)
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      const status =
        typeof (err as { status?: number })?.status === 'number'
          ? (err as { status: number }).status
          : 400;
      const message =
        err instanceof Error ? err.message : 'Invalid request sent to API endpoint.';
      res.status(status).json({ error: message });
      return;
    }
    next(err);
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
