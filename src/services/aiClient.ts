export async function postAiJson<TResponse>(
  endpoint: string,
  payload: unknown
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      'Network error: Unable to reach the Career-X AI service. Check your internet connection and try again.'
    );
  }

  const rawText = await response.text();
  const trimmed = rawText.trim();
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  let parsed: unknown = null;
  if (trimmed) {
    const looksLikeHtmlOrPlainNotFound =
      trimmed.startsWith('<!') ||
      trimmed.startsWith('<html') ||
      trimmed.startsWith('The page could not be found');

    if (contentType.includes('application/json') || (!looksLikeHtmlOrPlainNotFound && (trimmed.startsWith('{') || trimmed.startsWith('[')))) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = null;
      }
    }
  }

  if (!response.ok) {
    const apiError =
      parsed &&
      typeof parsed === 'object' &&
      'error' in parsed &&
      typeof (parsed as { error?: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : null;

    if (apiError) {
      throw new Error(apiError);
    }

    if (response.status === 404 || trimmed.startsWith('The page could not be found')) {
      throw new Error(
        `AI backend endpoint (${endpoint}) returned 404 Not Found. Verify the /api serverless functions are deployed and GEMINI_API_KEY is configured.`
      );
    }

    if (trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
      throw new Error(
        `Server returned an HTML error page (HTTP ${response.status}) instead of JSON. Please verify backend API routing and GEMINI_API_KEY configuration.`
      );
    }

    throw new Error(
      trimmed
        ? `AI service error (HTTP ${response.status}): ${trimmed.slice(0, 180)}`
        : `AI service returned an empty error response (HTTP ${response.status}).`
    );
  }

  if (!trimmed) {
    throw new Error('AI service returned an empty response. Please try again.');
  }

  if (parsed === null) {
    throw new Error(
      'AI service returned a non-JSON response. Ensure /api routes are running properly and not returning an HTML page.'
    );
  }

  return parsed as TResponse;
}
