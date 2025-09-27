import { useCallback, useMemo, useState } from 'react';
import { analyzePrompt } from '../../../../infrastructure/api/iaApi';

export type ChatRole = 'user' | 'astro';
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
}

// No normalization needed: backend returns a plain string

export function useAstroChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  type CryptoLike = { randomUUID?: () => string };
  const randomId = useMemo(() => {
    return () => {
      const g = globalThis as unknown as { crypto?: CryptoLike };
      const c = g.crypto;
      if (c && typeof c.randomUUID === 'function') {
        return c.randomUUID();
      }
      return Math.random().toString(36).slice(2);
    };
  }, []);

  const send = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    const userMsg: ChatMessage = {
      id: randomId(),
      role: 'user',
      content: prompt,
      ts: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const raw = (await analyzePrompt(prompt)) as unknown;
      const text = typeof raw === 'string' ? raw : (() => { try { return JSON.stringify(raw, null, 2); } catch { return String(raw); } })();
      const aiMsg: ChatMessage = {
        id: randomId(),
        role: 'astro',
        content: text,
        ts: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errMsg: ChatMessage = {
        id: randomId(),
        role: 'astro',
        content: e instanceof Error ? `Error: ${e.message}` : 'Error desconocido al consultar la IA',
        ts: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [randomId]);

  const clear = useCallback(() => setMessages([]), []);

  return useMemo(() => ({ messages, loading, send, clear }), [messages, loading, send, clear]);
}

export default useAstroChat;
