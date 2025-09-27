import { http } from './http';

type AnalyzePayload = {
  prompt: string;
};

// Backend returns a plain string (application/json string), e.g. "Respuesta ..."
export async function analyzePrompt(prompt: string): Promise<string> {
  const payload: AnalyzePayload = { prompt };
  const data = await http<string>('ia/analizar', 'POST', payload);
  return data;
}

type FeedbackPayload = {
  messageId?: string;
  feedbackType: 'useful' | 'clarify' | 'other';
  message?: string;
};

// Optional: send feedback to backend. If endpoint doesn't exist, this will surface an error
export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  try {
    await http('ia/feedback', 'POST', payload);
  } catch (err) {
    // swallow errors to keep UX resilient when backend is absent
    console.warn('feedback failed', err);
  }
}

export default {};
