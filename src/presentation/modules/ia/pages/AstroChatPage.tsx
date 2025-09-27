import { useEffect, useMemo, useRef, useState } from 'react';
import { useAstroChat } from '../hooks/useAstroChat';

// Página limpia y mínima del chat Astro
export default function AstroChatPage() {
  const { messages, loading, send, clear } = useAstroChat();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'Resumen de ventas del día',
    'Órdenes pendientes por estado',
    'Top 5 productos más vendidos este mes',
  ];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSend) return;
    const v = input.trim();
    send(v);
    setInput('');
  };

  const sendSuggestion = (s: string) => {
    if (loading) return;
    send(s);
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* noop */ }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#3b0b0b] via-[#5d1010] to-[#0f0a0a] p-4 md:p-6"> 
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">Astro — Asistente IA</h1>
            <p className="text-white/70 text-sm">Consulta de negocio para CEO/Admin.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copy(messages.map(m => `${m.role === 'user' ? 'Yo' : 'Astro'}: ${m.content}`).join('\n\n'))}
              className="text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >Copiar conversación</button>
            <button
              onClick={clear}
              className="text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >Limpiar</button>
          </div>
        </div>

        {/* Sugerencias */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              disabled={loading}
              onClick={() => sendSuggestion(s)}
              className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >{s}</button>
          ))}
        </div>

        {/* Chat */}
        <div className="rounded-xl bg-white/10 border border-white/10 backdrop-blur-md min-h-[60vh] flex flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="h-full grid place-items-center text-white/70 text-sm">
                Empieza a conversar con Astro.
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-white text-gray-900'}`}>
                  <div className="whitespace-pre-wrap">{String(m.content ?? '')}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-white/80 text-sm">Astro está pensando…</div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={onSubmit} className="border-t border-white/10 p-3 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Escribe tu consulta y presiona Enter"
              className="flex-1 resize-none rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/30"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-lg px-4 py-2 bg-red-600 text-white disabled:opacity-50"
            >Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
