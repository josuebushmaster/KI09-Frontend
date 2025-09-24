import { http } from './http';
import type { IAResponse } from '../../domain/entities/ia';

type AnalyzePayload = {
  prompt: string;
};

export async function analyzePrompt(prompt: string): Promise<IAResponse> {
  const payload: AnalyzePayload = { prompt };
  const data = await http<IAResponse>('ia/analizar', 'POST', payload);
  return data;
}

export default {};
