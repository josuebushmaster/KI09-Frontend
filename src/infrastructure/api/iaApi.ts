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

export default {};
