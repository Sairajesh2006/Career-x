import type { VercelReq, VercelRes } from '../server/vercelAdapter';

export default function handler(_req: VercelReq, res: VercelRes): void {
  const payload = {
    status: 'ok',
    service: 'career-x-api',
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    ),
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (typeof res.status === 'function') {
    const statusRes = res.status(200);
    if (typeof statusRes?.json === 'function') {
      statusRes.json(payload);
      return;
    }
  }
  res.statusCode = 200;
  res.end(JSON.stringify(payload));
}
