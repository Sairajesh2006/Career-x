import type { IncomingMessage, ServerResponse } from 'http';
import { ApiHttpError } from './aiService';

export interface VercelReq extends IncomingMessage {
  body?: unknown;
}

export interface VercelRes extends ServerResponse {
  status?: (code: number) => VercelRes;
  json?: (payload: unknown) => void;
}

function sendJson(res: VercelRes, statusCode: number, payload: unknown): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (typeof res.status === 'function') {
    const statusRes = res.status(statusCode);
    if (typeof statusRes?.json === 'function') {
      statusRes.json(payload);
      return;
    }
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: VercelReq): Promise<Record<string, unknown>> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      return req.body.trim() ? (JSON.parse(req.body) as Record<string, unknown>) : {};
    }
    if (typeof req.body === 'object') {
      return req.body as Record<string, unknown>;
    }
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

export function createJsonPostHandler<TBody, TResult>(
  fn: (body: TBody) => Promise<TResult>
) {
  return async function handler(req: VercelReq, res: VercelRes): Promise<void> {
    if (req.method === 'OPTIONS') {
      res.setHeader('Allow', 'POST, OPTIONS');
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      sendJson(res, 405, { error: `Method ${req.method || 'UNKNOWN'} not allowed. Use POST.` });
      return;
    }

    try {
      const body = (await readJsonBody(req)) as TBody;
      const result = await fn(body);
      sendJson(res, 200, result);
    } catch (error) {
      if (error instanceof ApiHttpError) {
        sendJson(res, error.status, { error: error.message });
        return;
      }
      if (error instanceof SyntaxError) {
        sendJson(res, 400, { error: 'Invalid JSON payload in request body.' });
        return;
      }
      const message =
        error instanceof Error ? error.message : 'Unexpected server error while processing AI request.';
      sendJson(res, 500, { error: message });
    }
  };
}
